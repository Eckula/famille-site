/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [CurrentInterview]
      ,[DataId]
  FROM [Askia_WebProd].[dbo].[WP_InterviewCounter]

  SELECT TABLE_NAME as TABLE_Askia_WebProd
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';


SELECT 
    t1.[NomCorrectPourListID],
    t1.[NomCorrectPourSurveyID],
    COUNT(CASE WHEN t3.AskState = 0 AND t3.AskType = 0 THEN 1 END) AS Nb_Mails_Envoyes,
    COUNT(CASE WHEN t3.LastReadTimeUTC IS NOT NULL AND t3.AskType = 0 THEN 1 END) AS Nb_Mails_Ouverts,
    COUNT(CASE WHEN t3.LastResponseTimeUTC IS NOT NULL AND t3.AskType = 0 THEN 1 END) AS Nb_Questionnaire_Commences,
    COUNT(CASE WHEN t3.LastResult = 0 AND t3.AskType = 0 THEN 1 END) AS Nb_Questionnaire_Termines,
    COUNT(CASE WHEN t3.LastResult = 1005 AND t3.AskType = 0 THEN 1 END) AS Nb_Hors_Cible,
    COUNT(CASE WHEN t3.AskState > 0 AND t3.AskType = 0 THEN 1 END) AS Nb_Erreurs
FROM [Askia_Lists].[dbo].[AskList11648] AS t1
JOIN [Askia_Statistics].[dbo].[Statistic_Mail] AS t2 ON t1.[NomCorrectPourListID] = t2.[NomCorrectPourListID]
JOIN [Askia_Statistics].[dbo].[AskEmails] AS t3 ON t2.[NomCorrectPourEmailID] = t3.[NomCorrectPourEmailID]
WHERE t1.[NomCorrectPourSurveyID] = '4372'
GROUP BY t1.[NomCorrectPourListID], t1.[NomCorrectPourSurveyID];

SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Statistic_Mail';

SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'AskList11648';



