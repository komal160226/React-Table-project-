import React, { useState, useEffect } from "react";
import { 
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel 
} from "@tanstack/react-table";

import { db } from "./Firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Basic = () => {

  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [standard, setStandard] = useState("");
  const [section, setSection] = useState("");
  const [age, setAge] = useState("");

  const [editId, setEditId] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const getStudents = async () => {

    const querySnapshot = await getDocs(collection(db, "students"));

    const list = [];

    querySnapshot.forEach((doc) => {
      list.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setStudents(list);
  };

  useEffect(() => {
    getStudents();
  }, []);

  const addStudent = async () => {

    if (editId === null) {

      await addDoc(collection(db, "students"), {
        name: name,
        email: email,
        phone: phone,
        standard: standard,
        section: section,
        age: age
      });

    } else {

      const studentRef = doc(db, "students", editId);

      await updateDoc(studentRef, {
        name: name,
        email: email,
        phone: phone,
        standard: standard,
        section: section,
        age: age
      });

      setEditId(null);
    }

    setName("");
    setEmail("");
    setPhone("");
    setStandard("");
    setSection("");
    setAge("");

    getStudents();
  };

  const deleteStudent = async (id) => {

    const studentRef = doc(db, "students", id);

    await deleteDoc(studentRef);

    getStudents();
  };

  const editStudent = (student) => {

    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setStandard(student.standard);
    setSection(student.section);
    setAge(student.age);

    setEditId(student.id);
  };

  
  const downloadExcel = () => {

    const data = students.map((s) => ({
      Name: s.name,
      Email: s.email,
      Phone: s.phone,
      Class: s.standard,
      Section: s.section,
      Age: s.age
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream"
    });

    saveAs(file, "students.xlsx");
  };

  
  const downloadPDF = () => {

    const doc = new jsPDF();

    const columns = ["Name", "Email", "Phone", "Class", "Section", "Age"];

    const rows = students.map((s) => [
      s.name,
      s.email,
      s.phone,
      s.standard,
      s.section,
      s.age
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows
    });

    doc.save("students.pdf");
  };

  const columns = [

    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "standard", header: "Class" },
    { accessorKey: "section", header: "Section" },
    { accessorKey: "age", header: "Age" },

    {
      header: "Action",
      cell: ({ row }) => (

        <div className="flex gap-2">

          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => editStudent(row.original)}
          >
            Edit
          </button>

          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => deleteStudent(row.original.id)}
          >
            Delete
          </button>

        </div>

      )
    }

  ];
const table = useReactTable({
  data: students,
  columns: columns,
  state: { globalFilter },           
  onGlobalFilterChange: setGlobalFilter, 
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel() 
});

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <h2 className="text-3xl font-bold text-center mb-8">
        Student Management
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-8">

        <input
          className="border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Class"
          value={standard}
          onChange={(e) => setStandard(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

      </div>

    

      <div className="flex gap-4 mb-8">

        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
          onClick={addStudent}
        >
          Save Student
        </button>

        <button
          onClick={downloadExcel}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Download Excel
        </button>

        <button
          onClick={downloadPDF}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
<input
  type="text"
  placeholder="Search students..."
  value={globalFilter ?? ""}
  onChange={(e) => setGlobalFilter(e.target.value)}
  className="border p-2 mb-4 w-full"
/>
      </div>

      <div className="bg-white shadow-lg rounded">

        <table className="min-w-full">

          <thead className="bg-gray-800 text-white">

            {table.getHeaderGroups().map((headerGroup) => (

              <tr key={headerGroup.id}>

                {headerGroup.headers.map((header) => (

                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-6 py-3 cursor-pointer"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>

                ))}

              </tr>

            ))}

          </thead>

          <tbody>

            {table.getRowModel().rows.map((row) => (

              <tr key={row.id} className="border-b hover:bg-gray-100">

                {row.getVisibleCells().map((cell) => (

                  <td key={cell.id} className="px-6 py-3">

                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}

                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Basic;
