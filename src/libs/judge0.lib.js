// import axios from 'axios'

// export const getJudge0LanguageId = (language) => {
//   const languageMap = {
//     PYTHON: 71,
//     JAVA: 62,
//     JAVASCRIPT: 63,
//   };
//   return languageMap[language.toUpperCase()] || null;
// };

// const sleep = (ms) => {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }

// export const pollBatchResults = async(tokens) => {
//   while(true){
//     const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
//       params:{
//         tokens: tokens.join(","),
//         nase64_encoded: false,
//       }
//     })

//     console.log(` Data inside of pollBatchResults ${data}`)

//     // Here we are just taking the submissions of the data obkect and submission holds an array of objects witht he status id of each test case
//     const results = data.submissions;

//     const isAllDone = results.every((r) => r.status.id !== 1 && r.status.id !==2);

//     console.log("Results of pollBatchResults", results)

//     console.log(`Valus of isAllDone inside of pollBatchResults ${isAllDone}`)

//     if(isAllDone){
//       return results;
//     }
//     await sleep(1000)
//   }
// }

// export const submitBatch = async (submissions) => {
//   const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{
//     submissions
// })

//   console.log("Submission Results: ",data);
//   return data; 
//   // [
//   //   { token: "uuid-1", status: { /* … */ }, /* other fields… */ },
//   //   { token: "uuid-2", status: { /* … */ }, /* … */ },
//   //    one object per submission you sent
//   // ]
// }

// export function getLanguageName(LanguageId){
//   const LANGUAGE_NAME = {
//     74: "TypeScript",
//     63: "Javascript",
//     71: "Python",
//     62: "Java",
//   }

//   return LANGUAGE_NAME[LanguageId] || "Unknown"
// }



import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Ensure this is set in your .env file
const RAPIDAPI_HOST = 'judge0-ce.p.rapidapi.com';

const headers = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': RAPIDAPI_HOST,
  'Content-Type': 'application/json',
};

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()] || null;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const pollBatchResults = async (tokens) => {
  while (true) {
    try {
      const { data } = await axios.get(
        `${process.env.JUDGE0_API_URL}/submissions/batch`,
        {
          headers,
          params: {
            tokens: tokens.join(','),
            base64_encoded: false,
          },
        }
      );

      console.log(`Data inside of pollBatchResults: ${JSON.stringify(data)}`);

      const results = data.submissions;
      const isAllDone = results.every(
        (r) => r.status.id !== 1 && r.status.id !== 2
      );

      console.log('Results of pollBatchResults:', results);
      console.log(`Value of isAllDone inside of pollBatchResults: ${isAllDone}`);

      if (isAllDone) {
        return results;
      }
    } catch (error) {
      console.error('Error in pollBatchResults:', error);
    }
    await sleep(1000);
  }
};

export const submitBatch = async (submissions) => {
  try {
    const { data } = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
      { submissions },
      { headers }
    );

    console.log('Submission Results:', data);
    return data;
  } catch (error) {
    console.error('Error in submitBatch:', error);
  }
};

export function getLanguageName(languageId) {
  const LANGUAGE_NAME = {
    74: 'TypeScript',
    63: 'JavaScript',
    71: 'Python',
    62: 'Java',
  };

  return LANGUAGE_NAME[languageId] || 'Unknown';
}
