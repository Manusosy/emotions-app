-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ambassador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_ambassador_id ON appointments(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy for ambassadors to view their appointments
CREATE POLICY "Ambassadors can view their own appointments"
ON appointments FOR SELECT
TO authenticated
USING (ambassador_id = auth.uid());

-- Policy for patients to view their appointments
CREATE POLICY "Patients can view their own appointments"
ON appointments FOR SELECT
TO authenticated
USING (patient_id = auth.uid());

-- Policy for creating appointments
CREATE POLICY "Users can create appointments"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating appointments
CREATE POLICY "Users can update their own appointments"
ON appointments FOR UPDATE
TO authenticated
USING (
    patient_id = auth.uid() OR 
    ambassador_id = auth.uid()
);

-- Policy for deleting appointments
CREATE POLICY "Users can delete their own appointments"
ON appointments FOR DELETE
TO authenticated
USING (
    patient_id = auth.uid() OR 
    ambassador_id = auth.uid()
); 