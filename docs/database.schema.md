### Database Schema

#### Core Tables

1. Users

   - id (UUID)
   - email
   - password_hash
   - role (enum)
   - created_at
   - updated_at

2. Institutions

   - id (UUID)
   - name
   - status
   - settings (JSON)

3. Presets

   - id (UUID)
   - institution_id
   - name
   - settings (JSON)

4. Notices
   - id (UUID)
   - creator_id
   - preset_id (optional)
   - title
   - content
   - type (global/preset)
   - created_at

#### Relationship Tables

1. TeacherPresets

   - teacher_id
   - preset_id
   - assigned_at

2. StudentPresets
   - student_id
   - preset_id
   - assigned_at
