/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [AskInterview]
      ,[AskType]
      ,[AskEmail]
      ,[AskTimeUTC]
      ,[AskState]
      ,[AskLastRecoverUTC]
      ,[ReadCount]
      ,[LastReadTimeUTC]
      ,[LastResponseTimeUTC]
      ,[LastResponseUTCOffsetRespondent]
      ,[LastResult]
      ,[listId]
  FROM [ListesExternes].[dbo].[LISTE_UTILISEES]

  SELECT 
    COUNT(*) AS NbRelancesTerminees
FROM LISTE_UTILISEES
WHERE AskType > 0
  AND LastResult = 0
  AND CAST(LastResponseTimeUTC AS DATE) = CAST(GETDATE() AS DATE);


  SELECT COUNT(*) AS NbRelancesTerminees
FROM LISTE_UTILISEES
WHERE AskType > 0
  AND LastResult > 0;

-- Cette requête confirme qu’il y a bien des relances terminées (LastResult = 0) pour chaque liste.
SELECT ListId,
       COUNT(*) AS NbRelancesTermineesParListe
FROM LISTE_UTILISEES
WHERE AskType > 0
  AND LastResult = 0
GROUP BY ListId;


SELECT ListId, COUNT(*) AS NbHorsCibleRelancesParListe
FROM LISTE_UTILISEES
WHERE AskType > 0 AND LastResult = 1005
GROUP BY ListId;



SELECT 
  ListId, 
  COUNT(*) AS NbRelancesTotalesParListe
FROM LISTE_UTILISEES
WHERE AskType > 0
GROUP BY ListId;

CREATE VIEW [LISTE_UTILISEES] AS
  SELECT *, 12378 AS ListId FROM AskEmail12378
UNION
  SELECT *, 12379 AS ListId FROM AskEmail12379
UNION
  SELECT *, 12380 AS ListId FROM AskEmail12380


  SELECT AskType, COUNT(*) 
FROM AskEmail12378
GROUP BY AskType
ORDER BY AskType;


SELECT 
  ListId, 
  COUNT(*) AS NbRelancesTOTParListe
FROM LISTE_UTILISEES
WHERE AskType > 0
GROUP BY ListId;

SELECT 
  ListId, 
  COUNT(*) AS NbTermineesRelancesParListe
FROM LISTE_UTILISEES
WHERE AskType > 0 
  AND LastResult = 0
GROUP BY ListId;


SELECT ListId, COUNT(*) AS NbTermineesRelancesParListe
FROM LISTE_UTILISEES
WHERE AskType > 0 
  AND LastResult = 0
GROUP BY ListId;
















-- 1) Vérifiez qu’il y a bien des relances dans la vue
SELECT TOP(10) AskType, AskInterview, ListId
FROM [LISTE_UTILISEES]
WHERE AskType > 0;

-- 2) Exemple simple de “NB MAILS ENVOYÉS – RELANCES”  
SET NOCOUNT ON;
SELECT 'NB MAILS ENVOYÉS – RELANCES' AS Métrique,
  [12378], [12379], [12380], [12381], [12383]
FROM (
  SELECT 
    ListId AS V_SEGMENTATION,
    [AskInterview]
  FROM [LISTE_UTILISEES]
  WHERE AskState = 0
    AND AskType > 0     -- on ne retient que les relances
) AS src
PIVOT (
  COUNT(AskInterview)
  FOR V_SEGMENTATION IN ([12378], [12379], [12380], [12381], [12383])
) AS pvt;

SELECT 
  ListId, 
  AskType, 
  AskInterview
FROM [LISTE_UTILISEES]
WHERE ListId = 12379 
  AND AskType > 0 
  AND AskState = 0;


  SELECT COUNT(*) 
FROM [Askia_Lists].[dbo].[AskEmail12380]
WHERE AskType > 0 
  AND AskState = 0;

 DROP VIEW IF EXISTS [LISTE_UTILISEES];
CREATE VIEW [LISTE_UTILISEES] AS
  SELECT *, '12378' AS listId FROM [Askia_Lists].[dbo].[AskEmail12378]
  UNION ALL
  SELECT *, '12379' AS listId FROM [Askia_Lists].[dbo].[AskEmail12379]
  UNION ALL
  SELECT *, '12380' AS listId FROM [Askia_Lists].[dbo].[AskEmail12380]
  UNION ALL
  SELECT *, '12381' AS listId FROM [Askia_Lists].[dbo].[AskEmail12381]
  UNION ALL
  SELECT *, '12383' AS listId FROM [Askia_Lists].[dbo].[AskEmail12383];


  SELECT 
  ListId, 
  AskType, 
  AskState, 
  AskInterview,
  AskTimeUTC
FROM [LISTE_UTILISEES]
WHERE AskType > 0 
  AND AskState = 0
ORDER BY ListId, AskInterview;


SELECT 
  ListId,        -- devrait être “12380”
  AskType,       -- 0 = mail initial, 1 = 1re relance, 2 = 2e relance, etc.
  AskState,      -- 0 = mail envoyé OK, >0 = erreur ou autre
  AskInterview,
  AskTimeUTC
FROM [LISTE_UTILISEES]
WHERE 
  ListId    = 12379
  AND AskType > 0    -- on cherche les relances uniquement
ORDER BY AskInterview;

-- Pour 12380
SELECT ListId, AskType, AskState, AskInterview 
FROM [LISTE_UTILISEES]
WHERE ListId = 12380 AND AskType > 0;
-- Pour 12381
SELECT ListId, AskType, AskState, AskInterview 
FROM [LISTE_UTILISEES]
WHERE ListId = 12381 AND AskType > 0;
-- Pour 12383
SELECT ListId, AskType, AskState, AskInterview 
FROM [LISTE_UTILISEES]
WHERE ListId = 12383 AND AskType > 0;

-- Exemple pour la liste 12380
SELECT 
  AskType,    -- 0 = mail initial, 1 = relance 1, 2 = relance 2, etc.
  AskState,
  COUNT(*) AS NbOccurrences
FROM [Askia_Lists].[dbo].[AskEmail12380]
GROUP BY AskType, AskState
ORDER BY AskType, AskState;



SELECT ListId, AskType, AskState 
FROM [LISTE_UTILISEES]
WHERE AskType > 0 AND AskState = 0
ORDER BY ListId;





-- Pour 12379
SELECT AskType, AskState, COUNT(*) AS NbOcc
FROM [Askia_Lists].[dbo].[AskEmail12379]
GROUP BY AskType, AskState
ORDER BY AskType, AskState;

-- Pour 12380 (exemple déjà vu)
-- Pour 12381
SELECT AskType, AskState, COUNT(*) AS NbOcc
FROM [Askia_Lists].[dbo].[AskEmail12381]
GROUP BY AskType, AskState
ORDER BY AskType, AskState;

-- Pour 12383
SELECT AskType, AskState, COUNT(*) AS NbOcc
FROM [Askia_Lists].[dbo].[AskEmail12383]
GROUP BY AskType, AskState
ORDER BY AskType, AskState;

DROP VIEW IF EXISTS [LISTE_UTILISEES];
GO

CREATE VIEW [LISTE_UTILISEES] AS
SELECT *, '12378' AS ListId FROM [Askia_Lists].[dbo].[AskEmail12378]
UNION ALL
SELECT *, '12379' AS ListId FROM [Askia_Lists].[dbo].[AskEmail12379]
UNION ALL
SELECT *, '12380' AS ListId FROM [Askia_Lists].[dbo].[AskEmail12380]
UNION ALL
SELECT *, '12381' AS ListId FROM [Askia_Lists].[dbo].[AskEmail12381]
UNION ALL
SELECT *, '12383' AS ListId FROM [Askia_Lists].[dbo].[AskEmail12383];
GO


SET NOCOUNT ON;

SELECT 
    'NB MAILS ENVOYÉS – RELANCES' AS Métrique,
    [12378], [12379], [12380], [12381], [12383]
FROM (
    SELECT ListId AS V_SEGMENTATION, AskInterview
    FROM [LISTE_UTILISEES]
    WHERE AskType > 0
      AND AskState = 0
) AS src
PIVOT (
    COUNT(AskInterview)
    FOR V_SEGMENTATION IN ([12378], [12379], [12380], [12381], [12383])
) AS pvt;




SET NOCOUNT ON;

SELECT 
    'NB RELANCES (TOUTES STATUTS)' AS Métrique,
    [12378], [12379], [12380], [12381], [12383]
FROM (
    SELECT ListId AS V_SEGMENTATION, AskInterview
    FROM [LISTE_UTILISEES]
    WHERE AskType > 0    -- on garde toutes les relances, qu’elles soient ok ou en erreur
) AS src
PIVOT (
    COUNT(AskInterview)
    FOR V_SEGMENTATION IN ([12378], [12379], [12380], [12381], [12383])
) AS pvt;









/* --------------------------------------------------------------------------
   Fichier corrigé : StatEmails_RelancesComptage_Corrige.sql
   Objectif : Générer un CSV qui inclut TOUTES les colonnes de relance
   sans provoquer d’erreur de troncature (“VARCHAR(1)” vs “VARCHAR(10)”).
   -------------------------------------------------------------------------- */

/* 1) Supprimer les anciennes vues si besoin */
IF OBJECT_ID('dbo.LISTE_UTILISEES', 'V') IS NOT NULL
  DROP VIEW dbo.LISTE_UTILISEES;
IF OBJECT_ID('dbo.CONTACT', 'V') IS NOT NULL
  DROP VIEW dbo.CONTACT;

/* 2) Variables (IDs de listes, etc.) */
DECLARE
    @ID_LISTE1 VARCHAR(MAX) = '12378',
    @ID_LISTE2 VARCHAR(MAX) = '12379',
    @ID_LISTE3 VARCHAR(MAX) = '12380',
    @ID_LISTE4 VARCHAR(MAX) = '12381',
    @ID_LISTE5 VARCHAR(MAX) = '12383',
    @ID_LISTE6 VARCHAR(MAX) = '12384',
    @ID_LISTE7 VARCHAR(MAX) = '12385';

/* 3) Création de la vue CONTACT fusionnant toutes les listes d’abonnés */
DECLARE @VIEW1 NVARCHAR(MAX) = N'
CREATE VIEW [dbo].[CONTACT] AS
    SELECT 
      AskInterview, AskSurveyId, AskSurveyPosition, AskSurveyInterviewId, AskSurveyInterviewState,
      AskTaskInterviewGuid, AskPriority, AskDoNotMailListId, AskInterviewFiltered, AskTimeZoneId,
      AskMode, AskLastWebResponseUTC, AskLastWebResponseUTCOffsetRespondent, AskLastWebResult, AskWebWorkingPriority,
      ' + @ID_LISTE1 + ' AS ListId, [EMAIL]
    FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE1 + ']
  UNION
    SELECT 
      AskInterview,AskSurveyId,AskSurveyPosition,AskSurveyInterviewId,AskSurveyInterviewState,
      AskTaskInterviewGuid,AskPriority,AskDoNotMailListId,AskInterviewFiltered,AskTimeZoneId,
      AskMode,AskLastWebResponseUTC,AskLastWebResponseUTCOffsetRespondent,AskLastWebResult,AskWebWorkingPriority,
      ' + @ID_LISTE2 + ' AS ListId, [EMAIL]
    FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE2 + ']
  UNION
    SELECT 
      AskInterview,AskSurveyId,AskSurveyPosition,AskSurveyInterviewId,AskSurveyInterviewState,
      AskTaskInterviewGuid,AskPriority,AskDoNotMailListId,AskInterviewFiltered,AskTimeZoneId,
      AskMode,AskLastWebResponseUTC,AskLastWebResponseUTCOffsetRespondent,AskLastWebResult,AskWebWorkingPriority,
      ' + @ID_LISTE3 + ' AS ListId, [EMAIL]
    FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE3 + ']
  UNION
    SELECT 
      AskInterview,AskSurveyId,AskSurveyPosition,AskSurveyInterviewId,AskSurveyInterviewState,
      AskTaskInterviewGuid,AskPriority,AskDoNotMailListId,AskInterviewFiltered,AskTimeZoneId,
      AskMode,AskLastWebResponseUTC,AskLastWebResponseUTCOffsetRespondent,AskLastWebResult,AskWebWorkingPriority,
      ' + @ID_LISTE4 + ' AS ListId, [EMAIL]
    FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE4 + ']
  UNION
    SELECT 
      AskInterview,AskSurveyId,AskSurveyPosition,AskSurveyInterviewId,AskSurveyInterviewState,
      AskTaskInterviewGuid,AskPriority,AskDoNotMailListId,AskInterviewFiltered,AskTimeZoneId,
      AskMode,AskLastWebResponseUTC,AskLastWebResponseUTCOffsetRespondent,AskLastWebResult,AskWebWorkingPriority,
      ' + @ID_LISTE5 + ' AS ListId, [EMAIL]
    FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE5 + ']
  UNION
    SELECT 
      AskInterview,AskSurveyId,AskSurveyPosition,AskSurveyInterviewId,AskSurveyInterviewState,
      AskTaskInterviewGuid,AskPriority,AskDoNotMailListId,AskInterviewFiltered,AskTimeZoneId,
      AskMode,AskLastWebResponseUTC,AskLastWebResponseUTCOffsetRespondent,AskLastWebResult,AskWebWorkingPriority,
      ' + @ID_LISTE6 + ' AS ListId, [EMAIL]
    FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE6 + ']
  UNION
    SELECT 
      AskInterview,AskSurveyId,AskSurveyPosition,AskSurveyInterviewId,AskSurveyInterviewState,
      AskTaskInterviewGuid,AskPriority,AskDoNotMailListId,AskInterviewFiltered,AskTimeZoneId,
      AskMode,AskLastWebResponseUTC,AskLastWebResponseUTCOffsetRespondent,AskLastWebResult,AskWebWorkingPriority,
      ' + @ID_LISTE7 + ' AS ListId, [EMAIL]
    FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE7 + '];
';
EXEC sp_executesql @VIEW1;

/* 4) Création de la vue LISTE_UTILISEES fusionnant toutes les tables AskEmailN */
DECLARE @VIEW2 NVARCHAR(MAX) = N'
CREATE VIEW [dbo].[LISTE_UTILISEES] AS
    SELECT *, ' + @ID_LISTE1 + ' AS ListId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE1 + ']
  UNION SELECT *, ' + @ID_LISTE2 + ' AS ListId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE2 + ']
  UNION SELECT *, ' + @ID_LISTE3 + ' AS ListId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE3 + ']
  UNION SELECT *, ' + @ID_LISTE4 + ' AS ListId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE4 + ']
  UNION SELECT *, ' + @ID_LISTE5 + ' AS ListId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE5 + ']
  UNION SELECT *, ' + @ID_LISTE6 + ' AS ListId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE6 + ']
  UNION SELECT *, ' + @ID_LISTE7 + ' AS ListId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE7 + '];
';
EXEC sp_executesql @VIEW2;

/* 5) Création de la table temporaire #tmpRel AVANT tout INSERT :  
       on définit explicitement TOUTES les colonnes en VARCHAR(10)  
*/

CREATE TABLE #tmpRel (
  ListId                         VARCHAR(10),
  NbRelancesTOTParListe          VARCHAR(10),
  NbHorsCibleRelancesParListe    VARCHAR(10),
  NbTermineesRelancesParListe    VARCHAR(10),
  NbErreurRelancesParListe       VARCHAR(10),
  NbAbandonRelancesParListe      VARCHAR(10)
);

-- 6) INSÉRER le nombre TOTAL de relances (AskType > 0)
INSERT INTO #tmpRel
  (ListId, NbRelancesTOTParListe, NbHorsCibleRelancesParListe, 
   NbTermineesRelancesParListe, NbErreurRelancesParListe, NbAbandonRelancesParListe)
SELECT
  CAST(ListId AS VARCHAR(10))                           AS ListId,
  CAST(COUNT(*) AS VARCHAR(10))                         AS NbRelancesTOTParListe,
  CAST('' AS VARCHAR(10))                               AS NbHorsCibleRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbTermineesRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbErreurRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbAbandonRelancesParListe
FROM [dbo].[LISTE_UTILISEES]
WHERE AskType > 0
GROUP BY ListId;

-- 7) INSÉRER le nombre de relances “hors cible” (LastResult = 1005)
INSERT INTO #tmpRel
  (ListId, NbRelancesTOTParListe, NbHorsCibleRelancesParListe, 
   NbTermineesRelancesParListe, NbErreurRelancesParListe, NbAbandonRelancesParListe)
SELECT
  CAST(ListId AS VARCHAR(10))                           AS ListId,
  CAST('' AS VARCHAR(10))                               AS NbRelancesTOTParListe,
  CAST(COUNT(*) AS VARCHAR(10))                         AS NbHorsCibleRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbTermineesRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbErreurRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbAbandonRelancesParListe
FROM [dbo].[LISTE_UTILISEES]
WHERE AskType > 0
  AND LastResult = 1005
GROUP BY ListId;

-- 8) INSÉRER le nombre de relances “terminées” (LastResult = 0)
INSERT INTO #tmpRel
  (ListId, NbRelancesTOTParListe, NbHorsCibleRelancesParListe, 
   NbTermineesRelancesParListe, NbErreurRelancesParListe, NbAbandonRelancesParListe)
SELECT
  CAST(ListId AS VARCHAR(10))                           AS ListId,
  CAST('' AS VARCHAR(10))                               AS NbRelancesTOTParListe,
  CAST('' AS VARCHAR(10))                               AS NbHorsCibleRelancesParListe,
  CAST(COUNT(*) AS VARCHAR(10))                         AS NbTermineesRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbErreurRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbAbandonRelancesParListe
FROM [dbo].[LISTE_UTILISEES]
WHERE AskType > 0
  AND LastResult = 0
GROUP BY ListId;

-- 9) INSÉRER le nombre de relances “erreurs” (AskState > 0)
INSERT INTO #tmpRel
  (ListId, NbRelancesTOTParListe, NbHorsCibleRelancesParListe, 
   NbTermineesRelancesParListe, NbErreurRelancesParListe, NbAbandonRelancesParListe)
SELECT
  CAST(ListId AS VARCHAR(10))                           AS ListId,
  CAST('' AS VARCHAR(10))                               AS NbRelancesTOTParListe,
  CAST('' AS VARCHAR(10))                               AS NbHorsCibleRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbTermineesRelancesParListe,
  CAST(COUNT(*) AS VARCHAR(10))                         AS NbErreurRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbAbandonRelancesParListe
FROM [dbo].[LISTE_UTILISEES]
WHERE AskType > 0
  AND AskState > 0
GROUP BY ListId;

-- 10) INSÉRER le nombre de relances “abandons” (LastResult = 1006, si vous avez)
INSERT INTO #tmpRel
  (ListId, NbRelancesTOTParListe, NbHorsCibleRelancesParListe, 
   NbTermineesRelancesParListe, NbErreurRelancesParListe, NbAbandonRelancesParListe)
SELECT
  CAST(ListId AS VARCHAR(10))                           AS ListId,
  CAST('' AS VARCHAR(10))                               AS NbRelancesTOTParListe,
  CAST('' AS VARCHAR(10))                               AS NbHorsCibleRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbTermineesRelancesParListe,
  CAST('' AS VARCHAR(10))                               AS NbErreurRelancesParListe,
  CAST(COUNT(*) AS VARCHAR(10))                         AS NbAbandonRelancesParListe
FROM [dbo].[LISTE_UTILISEES]
WHERE AskType > 0
  AND LastResult = 1006
GROUP BY ListId;

-- 11) Pivot manuel pour n’avoir qu’une seule ligne par ListId
SELECT
   ListId,
   MAX(NbRelancesTOTParListe)        AS NbRelancesTOTParListe,
   MAX(NbHorsCibleRelancesParListe)  AS NbHorsCibleRelancesParListe,
   MAX(NbTermineesRelancesParListe)  AS NbTermineesRelancesParListe,
   MAX(NbErreurRelancesParListe)     AS NbErreurRelancesParListe,
   MAX(NbAbandonRelancesParListe)    AS NbAbandonRelancesParListe
FROM #tmpRel
GROUP BY ListId
ORDER BY CAST(ListId AS INT);

-- 12) Supprimer la table temporaire
DROP TABLE #tmpRel;
GO
