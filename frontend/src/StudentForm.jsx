import { message } from 'antd';
import { useState } from 'react';

const StudentForm = ({ onFormSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        place: '',
        class_id: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/students/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onFormSuccess();
                setFormData({ name: '', email: '', place: '', class_id: '' });
                message.success("record entered successfully")
            } else {
                const error = await response.json();
                message.error(`Error:${error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            message.error("Network Error");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name:</label>
            <br />
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            <br /><br />
            <label htmlFor="email">Email:</label>
            <br />
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            <br /><br />
            <label htmlFor="place">Place:</label>
            <br />
            <input type="text" id="place" name="place" value={formData.place} onChange={handleChange} required />
            <br /><br />
            <label htmlFor="class_id">Class:</label>
            <br />
            <select id="class_id" name="class_id" value={formData.class_id} onChange={handleChange} required>
                <option value="" disabled>Select a class</option>
                <option value="68c79f1ab04e1ee2abb09191">Standard: 1, Division: A</option>
                <option value="68c7a8e1b04e1ee2abb0919d">Standard: 1, Division: B</option>
            </select>
            <br /><br />
            <button type="submit">Submit</button>
        </form>
    );
};

export default StudentForm;
