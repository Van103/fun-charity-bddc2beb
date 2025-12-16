import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Edit2, Plus, X } from "lucide-react";

interface DetailItem {
  id: string;
  text: string;
  enabled: boolean;
}

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: { work: DetailItem[]; education: DetailItem[] }) => void;
}

export function EditDetailsModal({ isOpen, onClose, onSave }: EditDetailsModalProps) {
  const [workItems, setWorkItems] = useState<DetailItem[]>([
    { id: "1", text: "Làm việc tại GEIN Academy", enabled: true },
    { id: "2", text: "Làm việc tại Công Ty Cổ Phần Sáng Kiến Giáo Dục Toàn Cầu Gein", enabled: true },
    { id: "3", text: "Làm việc tại Leader tại Renaissance Team", enabled: true },
    { id: "4", text: "Làm việc tại Kế toán tài chính", enabled: true },
  ]);

  const [educationItems, setEducationItems] = useState<DetailItem[]>([
    { id: "1", text: "Từng học tại Nâng Đoàn Kim Cương", enabled: true },
    { id: "2", text: "Từng học tại Thấu Hiểu Nội Tâm - Kiến Tạo An Vui", enabled: true },
    { id: "3", text: "Từng học tại Sức Mạnh Tiềm Thức", enabled: true },
    { id: "4", text: "Từng học tại Hành Trình Tìm Lại Chính Mình", enabled: true },
    { id: "5", text: "Từng học tại 7 Ngày Khơi Nguồn Hạnh Phúc", enabled: true },
  ]);

  const [editingItem, setEditingItem] = useState<{ type: 'work' | 'education'; id: string } | null>(null);

  const toggleWork = (id: string) => {
    setWorkItems(items => items.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const toggleEducation = (id: string) => {
    setEducationItems(items => items.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const updateItemText = (type: 'work' | 'education', id: string, text: string) => {
    if (type === 'work') {
      setWorkItems(items => items.map(item => 
        item.id === id ? { ...item, text } : item
      ));
    } else {
      setEducationItems(items => items.map(item => 
        item.id === id ? { ...item, text } : item
      ));
    }
  };

  const handleSave = () => {
    onSave?.({ work: workItems, education: educationItems });
    onClose();
  };

  const renderDetailItem = (
    item: DetailItem, 
    type: 'work' | 'education',
    onToggle: (id: string) => void
  ) => {
    const isEditing = editingItem?.type === type && editingItem?.id === item.id;

    return (
      <div key={item.id} className="flex items-center gap-3 py-2">
        <Switch 
          checked={item.enabled} 
          onCheckedChange={() => onToggle(item.id)}
          className="data-[state=checked]:bg-primary"
        />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={item.text}
              onChange={(e) => updateItemText(type, item.id, e.target.value)}
              onBlur={() => setEditingItem(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
              autoFocus
              className="h-8"
            />
          ) : (
            <span className="text-sm text-foreground truncate block">{item.text}</span>
          )}
        </div>
        <button 
          onClick={() => setEditingItem({ type, id: item.id })}
          className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
        >
          <Edit2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Chỉnh sửa chi tiết</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground text-center pb-4 border-b border-border">
          Thông tin bạn chọn sẽ ở chế độ Công khai và hiển thị ở đầu trang cá nhân của bạn.
        </p>

        <div className="space-y-6 py-4">
          {/* Danh xưng */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Danh xưng</h4>
            <button className="flex items-center gap-2 text-primary hover:underline text-sm">
              <Plus className="w-4 h-4" />
              Thêm danh xưng
            </button>
          </div>

          {/* Công việc */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Công việc</h4>
            <div className="space-y-1">
              {workItems.map(item => renderDetailItem(item, 'work', toggleWork))}
            </div>
            <button className="flex items-center gap-2 text-primary hover:underline text-sm mt-3">
              <Plus className="w-4 h-4" />
              Thêm nơi làm việc
            </button>
          </div>

          {/* Học vấn */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Học vấn</h4>
            <div className="space-y-1">
              {educationItems.map(item => renderDetailItem(item, 'education', toggleEducation))}
            </div>
            <button className="flex items-center gap-2 text-primary hover:underline text-sm mt-3">
              <Plus className="w-4 h-4" />
              Thêm trường trung học
            </button>
            <button className="flex items-center gap-2 text-primary hover:underline text-sm mt-2">
              <Plus className="w-4 h-4" />
              Thêm trường cao đẳng/đại học
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button className="text-primary hover:underline text-sm font-medium">
            Cập nhật thông tin
          </button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              Lưu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}