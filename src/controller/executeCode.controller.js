import { db } from "../libs/db.js";

import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
  try {
    // console.log("inside execution controller")

    const { source_code, language_id, stdin, expected_outputs, problemId } =
      req.body;
    const userId = req.user.id;
    //Validate the test cases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid test cases",
      });
    }
    // Prepare each test cases for judge 0 batch submission

    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));
    // Send this batch submission to judge 0

    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((response) => response.token);
    // Poll judge0 for all the submitted test cases;

    const results = await pollBatchResults(tokens);

    console.log("Results-----------");
    console.log(results);

    //Analyze the case results
    let allPassed = true;
    const detailedResults = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;

      if (!passed) allPassed = false;

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compileOutput: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
      // console.log(`Testcase #${i+1}`);
      // console.log(`Input ${stdin[i]}`);
      // console.log(`Expected output for the testcase ${expected_output}`);
      // console.log(`Actual output ${stdout}`);

      // console.log(`Matched : ${passed}`);
    });

    console.log(detailedResults);
    // console.log(`Detail output: ${JSON.stringify(detailedResults)}`);

    //store submission summary
    const submission = await db.submissions.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
        stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,
        compileOutput: detailedResults.some((r) => r.compile_output)
          ? JSON.stringify(detailedResults.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.some((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,
        time: detailedResults.some((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
      },
    });

    //if all passed == true mark problem solved for the current user
    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    // Save individual test case results
    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));
    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await db.submissions.findUnique({
      where: {
        id: submission.id
      },
      include: {
        testCases: true,
      }
    })

    res.status(200).json({
      success: true,
      message: "Code executed successfully",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.log("Error executing code: ", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

