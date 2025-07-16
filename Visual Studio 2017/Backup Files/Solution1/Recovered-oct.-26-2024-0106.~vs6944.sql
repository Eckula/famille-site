/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [MailId]
      ,[EmailAddress]
      ,[SurveyId]
      ,[ListId]
      ,[ContactId]
      ,[Type]
      ,[Time]
      ,[SmtpUsed]
      ,[Sender]
      ,[Subject]
      ,[MailResult]
      ,[BouncedTime]
      ,[BouncedReason]
      ,[BouncedMail]
      ,[Cc]
      ,[Bcc]
      ,[ReplyTo]
  FROM [Askia_Statistics].[dbo].[Statistic_Mail]

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'Askia_Statistics';

SELECT TABLE_NAME as TABLE_Askia_Statistics
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';



SELECT DB_NAME() AS DatabaseName;

SELECT TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'AskSurveyId';


SELECT TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'ListID';


SELECT TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'EmailID';

SELECT 
    t1.[AskSurveyId], 
    t1.[Email_Address], 
    t2.[Nb_Mails_Envoyes],
    t2.[Nb_Mails_Ouverts],
    t3.[Nb_Questionnaire_Commences],
    t3.[Nb_Questionnaire_Termines]
FROM [Askia_Lists].[dbo].[AskList11648] AS t1
JOIN [Askia_Statistics].[dbo].[Statistic_Mail] AS t2 ON t1.[ListID] = t2.[ListId]
JOIN [Askia_Statistics].[dbo].[Statistic_WebInterview] AS t3 ON t1.[ListID] = t3.[ListId]
WHERE t1.[AskSurveyId] = '4372';


SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Statistic_Mail';


SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Statistic_WebInterview';

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
JOIN [Askia_Statistics].[dbo].[Statistic_Mail] AS t2 ON t1.ListID = t2.ListId
JOIN [Askia_Statistics].[dbo].[Statistic_WebInterview] AS t3 ON t1.ListID = t3.ListId
WHERE t1.AskSurveyId = '4372';
