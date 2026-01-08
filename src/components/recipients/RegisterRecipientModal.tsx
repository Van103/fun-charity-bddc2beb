import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, User, MapPin, FileText, Wallet, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const recipientSchema = z.object({
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100),
  location: z.string().min(2, 'Địa điểm không được để trống').max(200),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  story: z.string().min(50, 'Câu chuyện phải có ít nhất 50 ký tự').max(5000),
  wallet_address: z.string().optional(),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

const CATEGORIES = [
  { value: 'medical', label: 'Y tế / Sức khỏe' },
  { value: 'education', label: 'Giáo dục' },
  { value: 'housing', label: 'Nhà ở' },
  { value: 'livelihood', label: 'Sinh kế' },
  { value: 'disaster', label: 'Thiên tai' },
  { value: 'elderly', label: 'Người cao tuổi' },
  { value: 'children', label: 'Trẻ em' },
  { value: 'disability', label: 'Người khuyết tật' },
  { value: 'other', label: 'Khác' },
];

interface RegisterRecipientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterRecipientModal({ open, onOpenChange }: RegisterRecipientModalProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<RecipientFormData>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      full_name: '',
      location: '',
      category: '',
      story: '',
      wallet_address: '',
    },
  });

  const generateNFTTokenId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ANGEL-${timestamp}-${random}`;
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from('recipient-images')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('recipient-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const mutation = useMutation({
    mutationFn: async (data: RecipientFormData) => {
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const nftTokenId = generateNFTTokenId();

      const { error } = await supabase
        .from('charity_recipients')
        .insert({
          full_name: data.full_name,
          location: data.location,
          category: data.category,
          story: data.story,
          wallet_address: data.wallet_address || null,
          avatar_url: avatarUrl,
          nft_token_id: nftTokenId,
          is_verified: false,
          total_received: 0,
          donation_count: 0,
        });

      if (error) throw error;

      return { nftTokenId };
    },
    onSuccess: ({ nftTokenId }) => {
      toast.success('Đăng ký thành công!', {
        description: `NFT Token ID: ${nftTokenId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['top-recipients'] });
      form.reset();
      setAvatarFile(null);
      setAvatarPreview(null);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast.error('Đăng ký thất bại', {
        description: 'Vui lòng thử lại sau',
      });
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn', { description: 'Kích thước tối đa 5MB' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: RecipientFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Đăng Ký Người Nhận Từ Thiện
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-24 h-24 border-2 border-primary/20">
                <AvatarImage src={avatarPreview || ''} />
                <AvatarFallback className="bg-muted">
                  <User className="w-10 h-10 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Tải ảnh đại diện
                  </span>
                </Button>
              </label>
            </div>

            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Họ và tên
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Địa điểm
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Quận 1, TP. Hồ Chí Minh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục hỗ trợ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Story */}
            <FormField
              control={form.control}
              name="story"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Câu chuyện / Hoàn cảnh
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả hoàn cảnh và nhu cầu hỗ trợ..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wallet Address */}
            <FormField
              control={form.control}
              name="wallet_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Địa chỉ ví Crypto (tùy chọn)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký người nhận'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
