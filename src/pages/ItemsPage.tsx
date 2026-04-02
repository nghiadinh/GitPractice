import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { storageService } from "../services/storageService";
import { Category, Item } from "../types/models";

type ItemFormState = {
  name: string;
  sku: string;
  quantity: number;
  categoryId: string;
  location: string;
  note: string;
};

const emptyItem: ItemFormState = {
  name: "",
  sku: "",
  quantity: 0,
  categoryId: "",
  location: "",
  note: "",
};

export const ItemsPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyItem);

  const visibleItems = useMemo(() => {
    const key = search.trim().toLowerCase();
    if (!key) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(key) ||
        item.sku.toLowerCase().includes(key) ||
        item.location.toLowerCase().includes(key)
    );
  }, [items, search]);

  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const [categoryData, itemData] = await Promise.all([
        storageService.getCategories(),
        storageService.getItems(),
      ]);
      setCategories(categoryData);
      setItems(itemData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyItem, categoryId: categories[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      categoryId: item.categoryId,
      location: item.location,
      note: item.note,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.sku.trim() || !form.categoryId) {
      setError("Name, SKU and category are required");
      return;
    }

    if (form.quantity < 0) {
      setError("Quantity cannot be negative");
      return;
    }

    try {
      setError("");
      if (editingId) {
        await storageService.updateItem(editingId, form);
      } else {
        await storageService.createItem(form);
      }
      closeDialog();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    }
  };

  const removeItem = async (item: Item) => {
    const confirmed = window.confirm(`Delete item \"${item.name}\"?`);
    if (!confirmed) return;

    try {
      await storageService.deleteItem(item.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4">Item Management</Typography>
          <Typography color="text.secondary">Track stock items by category and location.</Typography>
        </Box>
        <Button variant="contained" onClick={openCreate} disabled={categories.length === 0}>
          Add Item
        </Button>
      </Stack>

      {categories.length === 0 && (
        <Alert severity="warning">Create at least one category before creating items.</Alert>
      )}

      <TextField label="Search items" value={search} onChange={(event) => setSearch(event.target.value)} />

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && visibleItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography py={2} align="center" color="text.secondary">
                    No items found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visibleItems.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{categoryNameById[item.categoryId] ?? "Unknown"}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => removeItem(item)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Item" : "New Item"}</DialogTitle>
        <Stack component="form" onSubmit={submitForm}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
              <TextField
                label="SKU"
                value={form.sku}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                required
              />
              <TextField
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                }
                inputProps={{ min: 0 }}
                required
              />
              <TextField
                label="Category"
                select
                value={form.categoryId}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Location"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              />
              <TextField
                label="Note"
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                multiline
                minRows={3}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </Stack>
  );
};
