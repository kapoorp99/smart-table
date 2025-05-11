'use client';

import React from "react";
import { SmartTable, type Column } from "prakhar-smart-table";
import "prakhar-smart-table/dist/index.css";

type Person = {
    id: string;
    name: string;
    age: number;
    city: string;
    department: string;
    position: string;
    startDate: string;
    salary: string;
};

const peopleData: Person[] = [
    {
        id: "1",
        name: "Alice", age: 24, city: "New York",
        department: "Engineering", position: "Developer",
        startDate: "2021-06-01", salary: "$90,000"
    },
    {
        id: "2",
        name: "Bob", age: 30, city: "Los Angeles",
        department: "Marketing", position: "Manager",
        startDate: "2019-03-15", salary: "$75,000"
    },
    {
        id: "3",
        name: "Charlie", age: 28, city: "Chicago",
        department: "Sales", position: "Executive",
        startDate: "2020-09-20", salary: "$80,000"
    },
    {
        id: "4",
        name: "David", age: 35, city: "Houston",
        department: "Engineering", position: "Lead Dev",
        startDate: "2018-01-12", salary: "$100,000"
    },
    {
        id: "5",
        name: "Eve", age: 22, city: "Phoenix",
        department: "Design", position: "UI/UX",
        startDate: "2022-02-10", salary: "$70,000"
    },
    {
        id: "6",
        name: "Frank", age: 29, city: "San Francisco",
        department: "HR", position: "Recruiter",
        startDate: "2021-11-05", salary: "$65,000"
    },
    {
        id: "7",
        name: "Grace", age: 31, city: "Seattle",
        department: "Finance", position: "Analyst",
        startDate: "2017-07-22", salary: "$85,000"
    },
    {
        id: "8",
        name: "Hank", age: 27, city: "Boston",
        department: "Engineering", position: "Intern",
        startDate: "2023-01-15", salary: "$50,000"
    },
    {
        id: "9",
        name: "Ivy", age: 26, city: "Denver",
        department: "Marketing", position: "Coordinator",
        startDate: "2020-05-30", salary: "$60,000"
    },
    {
        id: "10",
        name: "Jack", age: 33, city: "Miami",
        department: "Sales", position: "Manager",
        startDate: "2016-08-18", salary: "$95,000"
    },
    {
        id: "11",
        name: "Kathy", age: 23, city: "Atlanta",
        department: "Design", position: "Intern",
        startDate: "2023-03-01", salary: "$55,000"
    },
    {
        id: "12",
        name: "Leo", age: 34, city: "Dallas",
        department: "HR", position: "Manager",
        startDate: "2015-04-10", salary: "$110,000"
    },
    {
        id: "13",
        name: "Mia", age: 25, city: "Austin",
        department: "Finance", position: "Intern",
        startDate: "2022-09-15", salary: "$52,000"
    },
    {
        id: "14",
        name: "Nina", age: 32, city: "Portland",
        department: "Engineering", position: "Senior Dev",
        startDate: "2019-12-01", salary: "$120,000"
    },
    {
        id: "15",
        name: "Oscar", age: 29, city: "San Diego",
        department: "Marketing", position: "Executive",
        startDate: "2020-11-20", salary: "$78,000"
    },
    {
        id: "16",
        name: "Paul", age: 36, city: "Las Vegas",
        department: "Sales", position: "Director",
        startDate: "2014-02-14", salary: "$130,000"
    },
    {
        id: "17",
        name: "Quinn", age: 21, city: "Orlando",
        department: "Design", position: "Junior Designer",
        startDate: "2023-05-01", salary: "$58,000"
    },
    {
        id: "18",
        name: "Ray", age: 30, city: "Philadelphia",
        department: "HR", position: "Generalist",
        startDate: "2018-10-10", salary: "$70,000"
    },
    {
        id: "19",
        name: "Sara", age: 28, city: "Baltimore",
        department: "Finance", position: "Manager",
        startDate: "2017-06-25", salary: "$88,000"
    },
    {
        id: "20",
        name: "Tom", age: 24, city: "Charlotte",
        department: "Engineering", position: "Junior Dev",
        startDate: "2022-04-20", salary: "$65,000"
    },
    {
        id: "21",
        name: "Uma", age: 31, city: "Columbus",
        department: "Marketing", position: "Senior Manager",
        startDate: "2016-09-30", salary: "$95,000"
    },
    {
        id: "22",
        name: "Vera", age: 27, city: "Indianapolis",
        department: "Sales", position: "Coordinator",
        startDate: "2021-07-15", salary: "$62,000"
    },
    {
        id: "23",
        name: "Will", age: 29, city: "Nashville",
        department: "Design", position: "Lead Designer",
        startDate: "2019-03-05", salary: "$85,000"
    },
    {
        id: "24",
        name: "Xena", age: 33, city: "Kansas City",
        department: "HR", position: "Director",
        startDate: "2015-12-12", salary: "$115,000"
    },
    {
        id: "25",
        name: "Yara", age: 22, city: "Virginia Beach",
        department: "Finance", position: "Intern",
        startDate: "2023-08-01", salary: "$50,000"
    },
];

const columns: Column<Person>[] = [
    {
        header: "Name",
        accessor: "name",
        sortable: true,
        frozen: true,
        visible: true,
    },
    {
        header: "Age", accessor: "age",
        sortable: true,
        filterable: true,
        filterKey: "age",
    },
    {
        header: "City", accessor: "city",
        frozen: true,
        sortable: false,
        filterable: true,
        // filterKey: "city",
    },
    {
        header: "Department", accessor: "department",
        filterable: true,
        filterKey: "department",
        sortable: true
    },
    { header: "Position", accessor: "position", sortable: true },
    { header: "Start Date", accessor: "startDate", sortable: true, frozen: true },
    { header: "Salary", accessor: "salary", sortable: true, frozen: true },
];

export default function Home() {
    return (
        <div style={{ padding: "2rem" }}>

            <div style={{
                // width: "480px",
                overflowX: "auto",
                // height: "400px",
            }}>
                <SmartTable<Person>
                    data={peopleData}
                    columns={columns}
                    pageSize={10}
                    currentPage={2}
                    // draggableRows={true}
                    tableTitle="Employee Directory"
                    tableSubtitle="List of employees in the company"
                    selectableRows={true}
                    stickyHeader={true}
                    onRowSelectChange={(selectedRows) => {
                        console.log("Selected rows:", selectedRows);
                    }}
                    allowExport={true}
                    exportFileName="employee-directory"
                    exportFileType="xlsx"
                    enableChatWithTable={true}
                    aiProvider="gemini"
                    geminiApiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY}
                    showLanguageSwitcher={true}
                    language="en"
                    enableVirtualization={true}
                />
            </div>
        </div>
    );
}
