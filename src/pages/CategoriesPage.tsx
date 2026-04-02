import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Category } from "../types/models";

type CategoryFormState = {
  name: string;
  description: string;
};

const emptyForm: CategoryFormState = {
  name: "",
  description: "",
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);

  const visibleCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return categories;

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(keyword) ||
        category.description.toLowerCase().includes(keyword)
    );
  }, [categories, search]);

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await storageService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setError("");
      if (editingId) {
        await storageService.updateCategory(editingId, form);
      } else {
        await storageService.createCategory(form);
      }
      closeDialog();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  const removeCategory = async (category: Category) => {
    const confirmed = window.confirm(
      `Delete category \"${category.name}\"? Related items will also be removed.`
    );
    if (!confirmed) return;

    try {
      await storageService.deleteCategory(category.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4">Category Management</Typography>
          <Typography color="text.secondary">Create, update, and remove inventory categories.</Typography>
        </Box>
        <Button variant="contained" onClick={openCreate}>
          Add Category
        </Button>
      </Stack>

      <TextField
        label="Search categories"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && visibleCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography py={2} align="center" color="text.secondary">
                    No categories found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visibleCategories.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(category)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => removeCategory(category)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
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
                label="Description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
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
