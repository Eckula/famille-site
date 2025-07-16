/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (13000) [ID_MYCONSOO]
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
      ,[VAGUE]
  FROM [ListesPanel].[dbo].[RET2547_Conforama_Post_test_OffresSiderantes]

   ALTER TABLE [ListesPanel].[dbo].[RET2547_Conforama_Post_test_OffresSiderantes]
   ALTER COLUMN [ID_MYCONSOO] bigint;

 
   ALTER TABLE [ListesPanel].[dbo].[RET2547_Conforama_Post_test_OffresSiderantes]
   ALTER COLUMN [ZONE] nvarchar(255);