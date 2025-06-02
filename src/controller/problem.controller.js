import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  submitBatch,
  pollBatchResults,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippet,
    referenceSolutions,
  } = req.body;

  //check user role
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "You are not allowed to create a problem",
    });
  }

  try {
    //Seoarating language and code
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      // here we are passing the language to get the id of the language
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported!`,
        });
      }
      //submission will hold each test cases with the source code, lanId, stdin, output
      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));
      // console.log("Error before hitting submitBatch method")

      //creating id's for each test cases. It will have token:id, status code etc
      const submissionResults = await submitBatch(submissions);

      // console.log("Error after hitting submitBatch method")

      //extracting only tokens of the submissionResults
      const tokens = submissionResults.map((rs) => rs.token);

      console.log("tokens of create problem", tokens);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }
    }
    //save
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippet,
        referenceSolutions,
        userId: req.user.id,
      },
    });
    res.status(201).json({
      message: "New problem created",
      problem: newProblem,
    });
  } catch (error) {
    return res.status(400).json({
      error: "Error while creating problem",
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      include: {
        solvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });
    if (!problems) {
      return res.status(404).json({
        error: "No problem found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Message fetched Successfully",
      problems,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error while fetching probelms",
    });
  }
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });
    if (!problem) {
      return res.status(404).json({
        error: "Problem not found",
      });
    }

    res.status(200).json({
      message: "Problem fetched Successfully",
      problem,
      sucess: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error finding problem",
      sucess: false,
    });
  }
};

export const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippet,
    referenceSolutions,
  } = req.body;

  //check user role
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "You are not allowed to update this problem",
    });
  }

  try {
    //Seoarating language and code
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      // here we are passing the language to get the id of the language
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported!`,
        });
      }
      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));
      // console.log("Error before hitting submitBatch method")

      const submissionResults = await submitBatch(submissions);
      // console.log("Error after hitting submitBatch method")

      const tokens = submissionResults.map((rs) => rs.token);

      console.log("tokens of create problem", tokens);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }
    }
    //save
    const updateProblem = await db.problem.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippet,
        referenceSolutions,
        userId: req.user.id,
      },
    });
    res.status(200).json({
      message: "Problem updated Successfully",
      problem: updateProblem,
    });
  } catch (error) {
    return res.status(400).json({
      error: "Error while updating problem",
    });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({ where: { id } });

    if (!problem) {
      return res.status(404).json({
        error: "Problem doesn't exist",
      });
    }
    await db.problem.delete({ where: { id } });
    res.status(200).json({
      message: "Problem deleted successfully",
      success: true,
      problem
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error deleting problem",
      success: false,
      error,
    });
  }
};

export const getAllProblemsSolvedByUser = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        solvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });
    
    res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      problems,
    });
  } catch (error) {
    console.log("Error fetching problems : ", error);
    return res.status(500).json({
      error: "Failed to fetch problems",
    });
  }
};
