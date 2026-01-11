-- Update reward_config with display_name, display_name_vi, icon_name, and sort_order for better UI display
UPDATE reward_config SET 
  display_name = 'Signup Bonus',
  display_name_vi = '🎉 Thưởng Đăng Ký',
  icon_name = 'sparkles',
  sort_order = 1
WHERE action_type = 'signup';

UPDATE reward_config SET 
  display_name = 'Text Post Reward',
  display_name_vi = '✍️ Thưởng Bài Viết',
  icon_name = 'file-text',
  sort_order = 2
WHERE action_type = 'post_text';

UPDATE reward_config SET 
  display_name = 'Image Post Reward',
  display_name_vi = '📸 Thưởng Đăng Ảnh',
  icon_name = 'image',
  sort_order = 3
WHERE action_type = 'post_image';

UPDATE reward_config SET 
  display_name = 'Video Post Reward',
  display_name_vi = '🎬 Thưởng Đăng Video',
  icon_name = 'video',
  sort_order = 4
WHERE action_type = 'post_video';

UPDATE reward_config SET 
  display_name = 'Donation Cashback',
  display_name_vi = '💖 Thưởng Quyên Góp',
  icon_name = 'heart',
  sort_order = 5
WHERE action_type = 'donation';

UPDATE reward_config SET 
  display_name = 'Referral Reward',
  display_name_vi = '🤝 Thưởng Giới Thiệu',
  icon_name = 'users',
  sort_order = 6
WHERE action_type = 'referral';

-- Add new reward config for peer-to-peer gifting (gift sender bonus)
INSERT INTO reward_config (action_type, reward_amount, reward_currency, is_active, display_name, display_name_vi, icon_name, sort_order, max_per_day)
SELECT 'peer_gift', 500, 'CAMLY', true, 'Gift Sending Bonus', '🎁 Thưởng Tặng Quà', 'gift', 7, 10000
WHERE NOT EXISTS (SELECT 1 FROM reward_config WHERE action_type = 'peer_gift');