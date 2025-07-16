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
	   ,[VAGUE]
  FROM [ListesPanel].[dbo].[ENO0103_ENOV_Baro_Inflation_Prix_V6]

  ALTER TABLE [ListesPanel].[dbo].[ENO0103_ENOV_Baro_Inflation_Prix_V6]
  ALTER COLUMN [ID_MYCONSOO] BIGINT;

    ALTER TABLE [ListesPanel].[dbo].[ENO0103_ENOV_Baro_Inflation_Prix_V6]
  ALTER COLUMN [ZONE] Float;

   ALTER TABLE [ListesPanel].[dbo].[ENO0103_ENOV_Baro_Inflation_Prix_V6]
  ADD [VAGUE] NVARCHAR(255);


UPDATE [dbo].[ENO0103_ENOV_Baro_Inflation_Prix_V6]
SET [VAGUE] = '6'
WHERE [ID_MYCONSOO] =55266

UPDATE [dbo].[ENO0103_ENOV_Baro_Inflation_Prix_V6]
SET [VAGUE] = '6';


  ALTER TABLE [ListesPanel].[dbo].[ENO0103_ENOV_Baro_Inflation_Prix_V6]
  ALTER COLUMN [VAGUE] Float;

  UPDATE [ListesPanel].[[dbo].[ENO0103_ENOV_Baro_Inflation_Prix_V6]
  SET [DATE_CREDIT] = '20/02/2025#';


 




