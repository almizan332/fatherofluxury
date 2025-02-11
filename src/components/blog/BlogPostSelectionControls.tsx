
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface BlogPostSelectionControlsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
}

const BlogPostSelectionControls = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkEdit,
  onBulkDelete,
}: BlogPostSelectionControlsProps) => {
  if (totalCount === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="selectAll"
          checked={selectedCount === totalCount && totalCount > 0}
          onCheckedChange={onSelectAll}
        />
        <label htmlFor="selectAll" className="text-sm">
          Select All ({selectedCount}/{totalCount})
        </label>
      </div>

      {selectedCount > 0 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkEdit}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Bulk Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {selectedCount} selected posts. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onBulkDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default BlogPostSelectionControls;
