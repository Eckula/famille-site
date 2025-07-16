CREATE VIEW [v_CONSOLIDATED_CONTACTS] AS 
SELECT [AskInterview], [AskSurveyId], [AskSurveyPosition], [AskSurveyInterviewId], 
       [AskSurveyInterviewState], [AskTaskInterviewGuid], [AskPriority], 
       [AskDoNotMailListId], [AskInterviewFiltered], [AskTimeZoneId], [AskMode], 
       [AskLastWebResponseUTC], [AskLastWebResponseUTCOffsetRespondent], 
       [AskLastWebResult], [AskWebWorkingPriority], 'ID1' AS listId, 
       [Email_Address] AS EMAIL 
FROM [Askia_Lists].[dbo].[AskListID1] 
WHERE [AUTRES_TYPE_ENERGIE] LIKE '%CIBLE%' AND [Email_Address] IS NOT NULL
UNION ALL
SELECT [AskInterview], [AskSurveyId], [AskSurveyPosition], [AskSurveyInterviewId], 
       [AskSurveyInterviewState], [AskTaskInterviewGuid], [AskPriority], 
       [AskDoNotMailListId], [AskInterviewFiltered], [AskTimeZoneId], [AskMode], 
       [AskLastWebResponseUTC], [AskLastWebResponseUTCOffsetRespondent], 
       [AskLastWebResult], [AskWebWorkingPriority], 'ID2' AS listId, 
       [Email_Address] AS EMAIL 
FROM [Askia_Lists].[dbo].[AskListID2] 
WHERE [AUTRES_TYPE_ENERGIE] LIKE '%CIBLE%' AND [Email_Address] IS NOT NULL;





USE [Askia_Lists];
GO

SELECT * 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('AskListID1', 'AskListID2');










CREATE PROCEDURE [sp_GenerateReport]
    @ListIds VARCHAR(MAX),
    @Dates VARCHAR(MAX)
AS
BEGIN
    DECLARE @sql NVARCHAR(MAX);
    
    SET @sql = '
    SELECT ''NB MAILS ENVOYES - MAIL 1'',' + @Dates + '
    FROM (
        SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] 
        FROM [LISTE_UTILISEES] 
        WHERE AskState = 0 AND AskType = 0 AND ListId IN (' + @ListIds + ')
    ) AS tab1
    PIVOT (
        Count (AskInterview)
        FOR V_SEGMENTATION IN (' + @Dates + ')
    ) AS Tab2';
    
    EXEC sp_executesql @sql;
END;


EXEC sp_GenerateReport 
    @ListIds = '11629,11630,11631',
    @Dates = '[2024-07-15],[2024-07-16],[2024-07-17]';



USE [NomDeLaBase]; 
GO 
SELECT * FROM sys.procedures WHERE name = 'sp_GenerateReport';



SELECT *
  FROM [Enov].[dbo].[ListeNoire]
  WHERE [Raison]  LIKE 'BFA0127_MGEN_Baro_Digital_2024';


    SELECT *
  FROM [Enov].[dbo].[ListeNoire]
  WHERE [Raison]  LIKE '%BFA0127%';




