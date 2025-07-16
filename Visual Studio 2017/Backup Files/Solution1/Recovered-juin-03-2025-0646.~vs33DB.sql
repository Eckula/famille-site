/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (15000) [ID_MYCONSOO]
      ,[EMAIL]
      ,[PRENOM]
      ,[NOM]
      ,[DATE_NAISS]
      ,[VILLE]
      ,[CP]
      ,[DUREE]
      ,[POINTS]
      ,[DATE_CREDIT]
      ,[CODE]
      ,[SEXE]
      ,[AGEclair]
      ,[AGE]
      ,[CSP]
      ,[DPT]
      ,[ZONE]
      ,[TAILLE_FOYER]
  FROM [ListesPanel].[dbo].[TCT1371_RED_SFR_BilanImage]


ALTER TABLE [ListesPanel].[dbo].[TCT1371_RED_SFR_BilanImage]
ALTER COLUMN [ZONE] nvarchar(255);

UPDATE [ListesPanel].[dbo].[TCT1371_RED_SFR_BilanImage]
SET [POINTS] = 120;
