import React, { useEffect, useState } from "react";

const HTMLCodeDisplay = ({ htmlCode }) => {
  return (
    <pre
      dangerouslySetInnerHTML={{ __html: htmlCode }}
      className="max-w-full overflow-x-auto"
    />
  );
};

const Posts = () => {
  const [tagged, setTagged] = useState(""); // Default tag
  const [questions, setQuestions] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [expandedAnswers, setExpandedAnswers] = useState({});


  useEffect(() => {
    // getting the questions from the site 
    const fetchQuestions = async () => {
      try {
        // Fetching data for questions with the specified tag
        const response = await fetch(
          `https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${tagged}&site=stackoverflow&filter=!6WPIomnMOOD*e`
        );
        const data = await response.json();
        if (data.items) {
          // Display a certain number of random questions (e.g., 5)
          const randomQuestions = data.items.slice(0, 10);
          setQuestions(randomQuestions);
          // Fetch answers for each question
          fetchAnswers(randomQuestions);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // getting the answers from the site
    const fetchAnswers = async (questions) => {
      const answersPromises = questions.map(async (question) => {
        const response = await fetch(
          `https://api.stackexchange.com/2.3/questions/${question.question_id}/answers?order=desc&sort=votes&site=stackoverflow&filter=!6WPIomnMOOD*e`
        );
        const data = await response.json();
        return { questionId: question.question_id, answers: data.items };
      });

      const answersData = await Promise.all(answersPromises);

      const answersMap = {};
      answersData.forEach(({ questionId, answers }) => {
        answersMap[questionId] = answers;
      });

      setAnswers(answersMap);
    };


    fetchQuestions();
  }, [tagged]);

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };



  const toggleAnswers = (questionId) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };



  const handleTagChange = (e) => {
    setTagged(e.target.value);
  };



  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        Stack Overflow Questions Tagged with {tagged}
      </h1>
      <form className="mb-4">
        <label className="mr-2">
          Enter Subject:
          <input
            type="text"
            value={tagged}
            onChange={handleTagChange}
            className="border p-2"
          />
        </label>
      </form>
      <div className="grid grid-cols-1  gap-4">
        {questions.map((question) => (
          <div
            key={question.question_id}
            className="bg-white p-4 border rounded-md shadow-md"
          >
            <a
              href={question.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-bold text-lg mb-2 block"
            >
              {question.title}
            </a>
            <button
              onClick={() => toggleQuestion(question.question_id)}
              className="text-blue-500 hover:underline mb-2 block"
            >
              {expandedQuestions[question.question_id]
                ? "Close the Question"
                : "Show me the full Question"}
            </button>

            
            {expandedQuestions[question.question_id] &&
                <HTMLCodeDisplay htmlCode={question.body} />
              }
            
            <button
            onClick={() => toggleAnswers(question.question_id)}
            className="text-blue-500 hover:underline mb-2 block"
          >
            {expandedAnswers[question.question_id]
                ? "Close the Answers"
                : "Show me The Answers"}

            </button>
            {expandedAnswers[question.question_id] &&
              answers[question.question_id] &&
              answers[question.question_id].map((answer) => (
                <HTMLCodeDisplay key={answer.answer_id} htmlCode={answer.body} />
              ))}
              
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
