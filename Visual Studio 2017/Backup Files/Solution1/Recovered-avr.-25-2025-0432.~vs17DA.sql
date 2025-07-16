/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (20000) [ID_MYCONSOO]
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
      ,[LISTE_NOIRE]
  FROM [ListesPanel].[dbo].[RET2579_CPW_SHOPPER_Cereales_et_Barress_cereales]

ALTER TABLE  [ListesPanel].[dbo].[RET2579_CPW_SHOPPER_Cereales_et_Barress_cereales]
ALTER COLUMN [ZONE] NVARCHAR (255);


ALTER TABLE  [ListesPanel].[dbo].[RET2579_CPW_SHOPPER_Cereales_et_Barress_cereales]
ALTER COLUMN [ZONE] NVARCHAR (255);


