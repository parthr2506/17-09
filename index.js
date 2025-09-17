const express = require("express")
const cors = require("cors")
const { getDb, connectToDb } = require("./db");
const { ObjectId } = require('mongodb');

const app = express()
app.use(express.json())
app.use(cors())

let db
connectToDb((error) => {
    if (!error) {
        app.listen(5000, () => {
            console.log("Listening on 5000....")
        })
        db = getDb()
    }
})

app.get("/students", async (req, res) => {
    try {
        const { query, field, sortField, sortOrder } = req.query;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 3;
        const skip = (page - 1) * pageSize;

        let filter = {};
        if (field && query) {
            if (field === "name") {
                filter.name = { $regex: query, $options: "i" }
            }
            else if (field === "place") {
                filter.place = { $regex: query, $options: "i" }
            }
        }
        let sort = {};
        if (sortField && sortOrder) {
            sort[sortField] = sortOrder === 'ascend' ? 1 : -1;
        }
        const totalCount = await db.collection("Students").countDocuments(filter);
        const students = await db.collection("Students")
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(pageSize)
            .toArray();

        res.status(200).json({
            students,
            currentPage: page,
            totalPages: Math.ceil(totalCount / pageSize),
            totalCount
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "No Records found" });
    }
});

app.post("/students/post", (req, res) => {
    const studentData = req.body;

    const studentToInsert = {
        name: studentData.name,
        email: studentData.email,
        place: studentData.place,
        class_id: new ObjectId(studentData.class_id)
    };

    db.collection("Students")
        .insertOne(studentToInsert)
        .then((result) => {
            res.status(201).json(result)
        })
        .catch((error) => {
            console.error("Error while inserting student details:", error);
            res.status(500).json({ error: "Could not insert the student record" })
        })
})
