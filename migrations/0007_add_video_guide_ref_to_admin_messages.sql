ALTER TABLE admin_messages ADD COLUMN video_guide_id varchar(255) REFERENCES video_guides(id) ON DELETE SET NULL;
