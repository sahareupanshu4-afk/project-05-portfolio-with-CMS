-- Portfolio CMS Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Admin users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    avatar_url TEXT,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Table
CREATE TABLE IF NOT EXISTS about (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    bio TEXT,
    resume_url TEXT,
    avatar_url TEXT,
    location VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    social_links JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    proficiency INTEGER DEFAULT 80,
    icon_url TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    thumbnail_url TEXT,
    images JSONB DEFAULT '[]',
    technologies JSONB DEFAULT '[]',
    live_url TEXT,
    github_url TEXT,
    category VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed',
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_image_url TEXT,
    category VARCHAR(255),
    tags JSONB DEFAULT '[]',
    read_time INTEGER DEFAULT 5,
    author_id UUID REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experience Table
CREATE TABLE IF NOT EXISTS experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    responsibilities JSONB DEFAULT '[]',
    technologies JSONB DEFAULT '[]',
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    company_logo_url TEXT,
    company_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    company VARCHAR(255),
    content TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    icon_url TEXT,
    features JSONB DEFAULT '[]',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table (Contact Form)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'unread',
    ip_address VARCHAR(50),
    user_agent TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    reply_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size INTEGER,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    uploaded_by UUID REFERENCES users(id),
    folder VARCHAR(255) DEFAULT 'general',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name VARCHAR(255) DEFAULT 'Portfolio',
    site_description TEXT,
    site_keywords JSONB DEFAULT '[]',
    logo_url TEXT,
    favicon_url TEXT,
    og_image_url TEXT,
    theme_color VARCHAR(7) DEFAULT '#3B82F6',
    social_links JSONB DEFAULT '{}',
    analytics_id VARCHAR(255),
    is_maintenance BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - change this!)
-- Password hash is for 'admin123' using bcrypt
INSERT INTO users (email, password, name, role) 
VALUES ('admin@example.com', '$2a$10$YourHashedPasswordHere', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default about content
INSERT INTO about (title, subtitle, description, bio) 
VALUES ('Upanshu Sahare', 'Full Stack Developer', 'I build exceptional digital experiences', 'Passionate developer with expertise in modern web technologies.')
ON CONFLICT DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (site_name, site_description) 
VALUES ('Portfolio', 'My personal portfolio website')
ON CONFLICT DO NOTHING;

-- Insert default skills for a fresher IT professional
INSERT INTO skills (name, category, proficiency, description, display_order) VALUES
-- Frontend Skills
('HTML5', 'Frontend', 90, 'Semantic HTML, accessibility, and best practices', 1),
('CSS3', 'Frontend', 85, 'Modern CSS, Flexbox, Grid, animations', 2),
('JavaScript', 'Frontend', 80, 'ES6+, DOM manipulation, async programming', 3),
('React.js', 'Frontend', 75, 'Component-based architecture, hooks, state management', 4),
('Next.js', 'Frontend', 70, 'Server-side rendering, routing, API routes', 5),
('Tailwind CSS', 'Frontend', 80, 'Utility-first CSS framework', 6),
-- Backend Skills
('Node.js', 'Backend', 70, 'Server-side JavaScript, Express.js', 7),
('Python', 'Backend', 65, 'Basic Python programming, scripting', 8),
('Express.js', 'Backend', 70, 'RESTful API development, middleware', 9),
('MongoDB', 'Database', 65, 'NoSQL database, CRUD operations', 10),
('MySQL', 'Database', 60, 'Relational database, SQL queries', 11),
-- Tools & Others
('Git', 'Tools', 80, 'Version control, branching, collaboration', 12),
('GitHub', 'Tools', 75, 'Repository management, CI/CD basics', 13),
('VS Code', 'Tools', 85, 'Code editor, extensions, debugging', 14),
('REST APIs', 'Backend', 75, 'API design, testing, documentation', 15),
('Responsive Design', 'Frontend', 85, 'Mobile-first approach, cross-browser compatibility', 16)
ON CONFLICT DO NOTHING;

-- Insert default experience for a fresher (Internship + Projects)
INSERT INTO experience (company, position, location, description, responsibilities, technologies, start_date, end_date, is_current, company_url, display_order) VALUES
(
  'Tech Startup Solutions',
  'Web Development Intern',
  'Remote',
  'Completed a 3-month internship where I worked on real-world web projects and gained hands-on experience in full-stack development.',
  '["Developed responsive web pages using React.js and Tailwind CSS", "Collaborated with senior developers on feature implementations", "Participated in code reviews and team meetings", "Fixed bugs and improved website performance", "Learned industry best practices and agile methodologies"]',
  '["React.js", "JavaScript", "Tailwind CSS", "Git", "REST APIs"]',
  '2025-06-01',
  '2025-08-31',
  false,
  'https://example.com',
  1
),
(
  'Personal Projects',
  'Freelance Developer',
  'Remote',
  'Built multiple web applications to strengthen my skills and showcase my abilities to potential employers.',
  '["Designed and developed portfolio website using Next.js", "Created e-commerce frontend with React and Redux", "Built RESTful APIs using Node.js and Express", "Implemented responsive designs for various clients"]',
  '["Next.js", "React.js", "Node.js", "MongoDB", "Tailwind CSS"]',
  '2024-01-01',
  NULL,
  true,
  NULL,
  2
),
(
  'College Tech Club',
  'Technical Lead',
  'Nagpur, India',
  'Led the web development team in organizing technical events and workshops for fellow students.',
  '["Organized coding workshops and hackathons", "Mentored junior students in web development", "Built and maintained club website", "Coordinated with other colleges for tech fests"]',
  '["HTML", "CSS", "JavaScript", "React.js", "Team Leadership"]',
  '2023-08-01',
  '2025-05-31',
  false,
  NULL,
  3
)
ON CONFLICT DO NOTHING;

-- Insert default services offered
INSERT INTO services (title, description, icon, features, display_order) VALUES
('Web Development', 'Building responsive and modern websites using latest technologies', 'code', '["Responsive Design", "Modern UI/UX", "Performance Optimized", "SEO Friendly"]', 1),
('Frontend Development', 'Creating interactive user interfaces with React and Next.js', 'layout', '["React.js Applications", "Next.js Websites", "Component Libraries", "State Management"]', 2),
('API Development', 'Developing RESTful APIs and backend services', 'server', '["RESTful APIs", "Node.js Backend", "Database Integration", "Authentication"]', 3),
('UI/UX Design', 'Designing clean and intuitive user interfaces', 'palette', '["User Research", "Wireframing", "Prototyping", "Responsive Designs"]', 4)
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies (for frontend)
CREATE POLICY "Public read about" ON about FOR SELECT USING (is_active = true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (is_active = true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (is_active = true);
CREATE POLICY "Public read blogs" ON blogs FOR SELECT USING (is_published = true);
CREATE POLICY "Public read experience" ON experience FOR SELECT USING (is_active = true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Service role can do everything (for backend API)
CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access on about" ON about FOR ALL USING (true);
CREATE POLICY "Service role full access on skills" ON skills FOR ALL USING (true);
CREATE POLICY "Service role full access on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Service role full access on blogs" ON blogs FOR ALL USING (true);
CREATE POLICY "Service role full access on experience" ON experience FOR ALL USING (true);
CREATE POLICY "Service role full access on testimonials" ON testimonials FOR ALL USING (true);
CREATE POLICY "Service role full access on services" ON services FOR ALL USING (true);
CREATE POLICY "Service role full access on messages" ON messages FOR ALL USING (true);
CREATE POLICY "Service role full access on media" ON media FOR ALL USING (true);
CREATE POLICY "Service role full access on site_settings" ON site_settings FOR ALL USING (true);