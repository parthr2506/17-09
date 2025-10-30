const express = require("express")
const cors = require("cors")
// const { ObjectId } = require('mongodb');
const prisma = require("./prisma/index")

const app = express()
app.use(express.json())
app.use(cors())

// let db
// connectToDb((error) => {
//     if (!error) {
//         app.listen(5000, () => {
//             console.log("Listening on 5000....")
//         })
//         db = getDb()
//     }
// })
app.listen(5000, () => {
    console.log("Listening on 5000....");
});

app.get("/students", async (req, res) => {
    try {
        const { query, field, sortField, sortOrder } = req.query;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 3;
        const skip = (page - 1) * pageSize;

        let where = {};
        if (field && query) {
            // if (field === "name") {
            //     filter.name = { $regex: query, $options: "i" }
            // }
            // else if (field === "place") {
            //     filter.place = { $regex: query, $options: "i" }
            // }
            where = {
                [field]: { contains: query, mode: 'insensitive' }
            };
        }
        let orderBy = {};
        if (sortField && sortOrder) {
            orderBy = { [sortField]: sortOrder === 'ascend' ? 'asc' : 'desc' }
        }

        const [students, totalCount] = await prisma.$transaction([
            prisma.students.findMany({
                where,
                orderBy,
                skip,
                take: pageSize,
                include: {
                    class: true
                }
            }),
            prisma.students.count({ where })
        ]);

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
//         const totalCount = await db.collection("Students").countDocuments(filter);
//         const students = await db.collection("Students")
//             .find(filter)
//             .sort(sort)
//             .skip(skip)
//             .limit(pageSize)
//             .toArray();

//         res.status(200).json({
//             students,
//             currentPage: page,
//             totalPages: Math.ceil(totalCount / pageSize),
//             totalCount
//         });
//     } catch (error) {
//         console.error("Error fetching students:", error);
//         res.status(500).json({ message: "No Records found" });
//     }
// });

app.post("/students/post", async (req, res) => {
    try {
        const studentData = req.body;
        const result = await prisma.students.create({
            data: {
                name: studentData.name,
                email: studentData.email,
                place: studentData.place,
                // class_id: new ObjectId(studentData.class_id),
                class: {
                    connect: { id: studentData.class_id }
                }

            }
        });
        res.status(201).json(result)
    } catch (error) {
        console.error("Error while inserting student details:", error);
        res.status(500).json({ error: "Could not insert the student record" });
    }
    // const studentData = req.body;

    // const studentToInsert = {
    //     name: studentData.name,
    //     email: studentData.email,
    //     place: studentData.place,
    //     class_id: new ObjectId(studentData.class_id)
    // };

    // db.collection("Students")
    //     .insertOne(studentToInsert)
    //     .then((result) => {
    //         res.status(201).json(result)
    //     })
    //     .catch((error) => {
    //         console.error("Error while inserting student details:", error);
    //         res.status(500).json({ error: "Could not insert the student record" })
    //     })
})
