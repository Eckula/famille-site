/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_MYCONSOO]
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