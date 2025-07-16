SELECT 
    t1.AskSurveyId, 
    t1.Email_Address, 
    t2.ListId AS Mail_ListId,
    t2.MailId,
    t2.Time AS MailSentTime,
    t2.Subject AS MailSubject,
    t3.ListId AS Interview_ListId,
    t3.StartTime AS InterviewStartTime,
    t3.EndTime AS InterviewEndTime
FROM [Askia_Lists].[dbo].[AskList11648] AS t1
JOIN [Askia_Statistics].[dbo].[Statistic_Mail] AS t2 ON t1.AskSurveyId = t2.SurveyId
JOIN [Askia_Statistics].[dbo].[Statistic_WebInterview] AS t3 ON t1.AskSurveyId = t3.SurveyId
WHERE t1.AskSurveyId = '4372';

SELECT DISTINCT ListID, SurveyID
FROM [Askia_Cca].[dbo].[Lists]
WHERE SurveyID = '4372';
SELECT 
    t1.[SurveyID], 
    t1.[ListID],
    t2.[Email_Address], 
    t2.[NOM], 
    t2.[PRENOM], 
    t2.[VILLE], 
    t2.[Mobile Phone],
    t3.[MailId],
    t3.[Time] AS [MailSentTime],
    t3.[Subject] AS [MailSubject],
    t4.[StartTime] AS [InterviewStartTime],
    t4.[EndTime] AS [InterviewEndTime]
FROM [Askia_Cca].[dbo].[Lists] AS t1
JOIN [Askia_Lists].[dbo].[AskList11784] AS t2 ON t1.[SurveyID] = t2.[AskSurveyId]
JOIN [Askia_Statistics].[dbo].[Statistic_Mail] AS t3 ON t1.[ListID] = t3.[ListId]
JOIN [Askia_Statistics].[dbo].[Statistic_WebInterview] AS t4 ON t1.[ListID] = t4.[ListId]
WHERE t1.[SurveyID] = '4372' AND t1.[ListID] IN (11784, 11783, 11848, 11847, 11782);



SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Statistic_Mail';

SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'AskList11784';


SELECT 
    t1.[SurveyID], 
    t1.[ListID],
    t3.[MailId],
    t3.[Time] AS [MailSentTime],
    t3.[Subject] AS [MailSubject],
    t4.[StartTime] AS [InterviewStartTime],
    t4.[EndTime] AS [InterviewEndTime]
FROM [Askia_Cca].[dbo].[Lists] AS t1
JOIN [Askia_Lists].[dbo].[AskList11784] AS t2 ON t1.[SurveyID] = t2.[AskSurveyId]
JOIN [Askia_Statistics].[dbo].[Statistic_Mail] AS t3 ON t1.[ListID] = t3.[ListId]
JOIN [Askia_Statistics].[dbo].[Statistic_WebInterview] AS t4 ON t1.[ListID] = t4.[ListId]
WHERE t1.[SurveyID] = '4372' AND t1.[ListID] IN (11784, 11783, 11848, 11847, 11782);


 SELECT [SurveyID], [ListID], [ExternalTable], [ListTitle]
    FROM [Askia_Cca].[dbo].[Lists]