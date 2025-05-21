import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { SearchFilters } from '../../context/SearchContext';
import { NoteFormat } from '../../types';

interface SearchFiltersDialogProps {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
}

const SearchFiltersDialog: React.FC<SearchFiltersDialogProps> = ({
  open,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = React.useState<SearchFilters>(filters);

  // Reset local filters when dialog opens
  React.useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [filters, open]);

  const handleFormatChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setLocalFilters({
      ...localFilters,
      format: value === 'all' ? null : (value as NoteFormat),
    });
  };

  const handleSortByChange = (event: SelectChangeEvent) => {
    setLocalFilters({
      ...localFilters,
      sortBy: event.target.value as 'updatedAt' | 'createdAt' | 'title',
    });
  };

  const handleSortDirectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({
      ...localFilters,
      sortDirection: event.target.value as 'asc' | 'desc',
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      format: null,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Search Filters</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mt: 1, mb: 3 }}>
          <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
            <InputLabel id="format-filter-label">Note Format</InputLabel>
            <Select
              labelId="format-filter-label"
              value={localFilters.format || 'all'}
              onChange={handleFormatChange}
              label="Note Format"
            >
              <MenuItem value="all">All Formats</MenuItem>
              <MenuItem value="text">Plain Text</MenuItem>
              <MenuItem value="markdown">Markdown</MenuItem>
              <MenuItem value="code">Code</MenuItem>
              <MenuItem value="task">Task List</MenuItem>
              <MenuItem value="link">Link</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 3 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={localFilters.sortBy}
              onChange={handleSortByChange}
              label="Sort By"
            >
              <MenuItem value="updatedAt">Last Updated</MenuItem>
              <MenuItem value="createdAt">Date Created</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend">Sort Direction</FormLabel>
            <RadioGroup
              aria-label="sort-direction"
              name="sort-direction"
              value={localFilters.sortDirection}
              onChange={handleSortDirectionChange}
            >
              <FormControlLabel
                value="desc"
                control={<Radio size="small" />}
                label={
                  localFilters.sortBy === 'title'
                    ? 'Descending (Z-A)'
                    : 'Descending (Newest first)'
                }
              />
              <FormControlLabel
                value="asc"
                control={<Radio size="small" />}
                label={
                  localFilters.sortBy === 'title'
                    ? 'Ascending (A-Z)'
                    : 'Ascending (Oldest first)'
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="inherit" sx={{ textTransform: 'none' }}>
          Reset Filters
        </Button>
        <Button onClick={handleApply} color="primary" variant="contained" sx={{ textTransform: 'none' }}>
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchFiltersDialog; 