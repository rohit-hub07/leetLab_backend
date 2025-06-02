import { db } from "../libs/db.js";

export const getAllSubmission = async(req, res)=>{
  try {
    const userId = req.user.id;

    const submissions = await db.submissions.findMany({
      where: {
        userId: userId
      },
      include: {
        problem: true,
      }
    })
    console.log("All submissions: ", submissions);
    res.status(200).json({
     success: true,
     message: "Submission fetched sucessfully",
     submissions
    })
  } catch (error) {
    console.log("Fetch Submissions Error: ", error.message);
    return res.status(500).json({
      error: "Failed to fetch submissions"
    });
  }
}

export const getSubmissionForProblem = async(req, res) =>{
  try {
    const userId = req.user.id;
    const problemId = req.params.problemId;
    const submissions = await db.submissions.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      }
    })

    res.status(200).json({
      success: true,
      message: "Submission fetched successfully",
      submissions,
    })
  } catch (error) {
    console.log("Error fetching submissions", error);
    return res.status(500).json({
      error: "Failed to fetch submissions"
    })
  }
}

export const getAllTheSubmissionsForProblem = async(req, res) => {
  try {
    const problemId = req.params.problemId;
    const submission = await db.submissions.count({
      where: {
        problemId: problemId,
      }
    });

    res.status(200).json({
      success: true,
      message: "Submission fetched successfully",
      count: submission
    })
  } catch (error) {
    console.log("fetch submission error");
    return res.status(500).json({
      error: "Failed to fetch submissions"
    })
  }
}