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
	   ,[VAGUE]
  FROM [ListesPanel].[dbo].[RET2604_CONFORAMA_Post_test_OffresSiderantes]
 
  UPDATE [ListesPanel].[dbo].[RET2604_CONFORAMA_Post_test_OffresSiderantes]
  SET DATE_CREDIT = '03/07/2025' 
  where DATE_CREDIT = '05/07/2025';


  ALTER TABLE [ListesPanel].[dbo].[RET2604_CONFORAMA_Post_test_OffresSiderantes]
  ADD VAGUE INT;

  UPDATE [ListesPanel].[dbo].[RET2604_CONFORAMA_Post_test_OffresSiderantes]
  SET VAGUE = 2;


  ALTER TABLE [ListesPanel].[dbo].[RET2604_CONFORAMA_Post_test_OffresSiderantes]
  ALTER COLUMN ZONE nvarchar(50);
