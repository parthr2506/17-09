import { useState, useEffect } from 'react';
import StudentForm from './StudentForm';
import { useDebounce } from './useDebounce'
import { Table, Input, Select, Button, Space, message } from 'antd';
import 'antd/dist/reset.css';

const { Option } = Select;

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchField, setSearchField] = useState('name');
  const [searchInput, setSearchInput] = useState('');
  const debouncedQuery = useDebounce(searchInput, 500);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3,
    total: 0,
  });
  const [sortInfo, setSortInfo] = useState({
    field: undefined,
    order: undefined,
  });

  const fetchStudents = async (currentPage, pageSize, currentSortInfo, currentSearchField, currentDebouncedQuery) => {
    setLoading(true);
    try {
      const queryString = currentDebouncedQuery ? `&field=${currentSearchField}&query=${currentDebouncedQuery}` : '';
      const sortString = currentSortInfo.field && currentSortInfo.order ? `&sortField=${currentSortInfo.field}&sortOrder=${currentSortInfo.order}` : '';
      const url = `http://localhost:5000/students?page=${currentPage}&pageSize=${pageSize}${queryString}${sortString}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network error');
      }
      const { students: fetchedStudents, totalCount } = await response.json();
      setStudents(fetchedStudents);
      setPagination(prev => ({ ...prev, total: totalCount, current: currentPage }));
    } catch (error) {
      console.error("cannot find data", error);
      message.error("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(pagination.current, pagination.pageSize, sortInfo, searchField, debouncedQuery, sortInfo.field, sortInfo.order);
  }, [searchField, debouncedQuery, pagination.current, pagination.pageSize, sortInfo.field, sortInfo.order]);

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchField('name');
    setSortInfo({ field: undefined, order: undefined });
  };

  const handleTableChange = (newPagination, _, sorter) => {
    const isSortChanged = sorter.field !== sortInfo.field || sorter.order !== sortInfo.order;

    const isPageSizeChanged = pagination.pageSize !== newPagination.pageSize;

    setPagination(prev => ({
      ...newPagination,
      current: isSortChanged || isPageSizeChanged ? 1 : newPagination.current,
    }));

    setSortInfo({
      field: sorter.field,
      order: sorter.order,
    });
  };

  // const handleDeleteStudent = async (_id) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/students/${_id}`, {
  //       method: 'DELETE',
  //     });
  //     if (!response.ok) {
  //       throw new Error('Failed to delete student');
  //     }
  //     message.success('Student record deleted successfully.');
  //     fetchStudents(pagination.current, pagination.pageSize, sortInfo, searchField, debouncedQuery);
  //   } catch (error) {
  //     message.error('Error deleting student: ' + error.message);
  //   }
  // };

  return (
    <div style={{ padding: "20px" }}>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search here...."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ width: 200 }}
        />

        <Select
          value={searchField}
          onChange={(value) => setSearchField(value)}
        >
          <Option value="name">By Name</Option>
          <Option value="place">By Place</Option>
        </Select>
        <Button type="default" onClick={handleClearSearch}>
          Clear
        </Button>
      </Space>

      <h2>Students Records</h2>
      <Table
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name', sorter: true },
          { title: 'Place', dataIndex: 'place', key: 'place', sorter: true },
          { title: 'Email', dataIndex: 'email', key: 'email', sorter: true },
          { title: 'Class ID', dataIndex: 'class_id', key: 'class_id' },
          // {
          //   title: 'Action',
          //   key: 'action',
          //   render: (_, record) => (
          //     <Space size="middle">
          //       <Button type="link">Edit</Button>
          //       <Button type="link" danger onClick={() => handleDeleteStudent(record._id)}>
          //         Delete
          //       </Button>
          //     </Space>
          //   ),
          // },
        ]}
        dataSource={students}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['1', '2', '3', '5', '10'],
        }}
        onChange={handleTableChange}
        loading={loading}
        rowKey="_id"
      />

      <h1>Add a New Student Details</h1>
      <StudentForm
        onFormSuccess={() => {
          fetchStudents(pagination.current, pagination.pageSize, sortInfo, searchField, debouncedQuery);
        }}
      />

    </div>
  );
}

export default App;
