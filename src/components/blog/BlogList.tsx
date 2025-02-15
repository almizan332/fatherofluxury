
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown } from "lucide-react";
import { BlogPost } from "@/hooks/blog/useBlogPosts";
import { useState } from "react";

interface BlogListProps {
  posts: BlogPost[];
  onCreatePost: () => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
}

const BlogList = ({ posts, onCreatePost, onEdit, onDelete }: BlogListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("5");
  const [sortColumn, setSortColumn] = useState<keyof BlogPost>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredPosts = posts.filter(post =>
    Object.values(post).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (column: keyof BlogPost) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#7EDBD0] p-4 rounded-t-lg flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Blog List</h1>
        <Button 
          onClick={onCreatePost}
          className="bg-[#1BB55C] hover:bg-[#159e4f] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Blog
        </Button>
      </div>

      <div className="flex justify-between items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Show</span>
          <select
            className="border rounded p-1"
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(e.target.value)}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm">entries</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Search:</span>
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[200px]"
          />
        </div>
      </div>

      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-12">SL#</TableHead>
              <TableHead onClick={() => handleSort("title")} className="cursor-pointer">
                <div className="flex items-center gap-1">
                  TITLE
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>IMAGE</TableHead>
              <TableHead className="text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPosts.slice(0, parseInt(entriesPerPage)).map((post, index) => (
              <TableRow key={post.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-10 w-10 rounded object-cover"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(post)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(post.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BlogList;
