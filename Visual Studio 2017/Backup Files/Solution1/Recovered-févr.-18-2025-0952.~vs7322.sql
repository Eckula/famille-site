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
  FROM [ListesPanel].[dbo].[RET2568_BURGER-KING_BaisseFrequentation]


   ALTER TABLE [ListesPanel].[dbo].[RET2568_BURGER-KING_BaisseFrequentation]
    ALTER COLUMN [DATE_CREDIT] NVARCHAR(255);

	
   ALTER TABLE [ListesPanel].[dbo].[RET2568_BURGER-KING_BaisseFrequentation]
    ALTER COLUMN [ZONE] NVARCHAR(255);


	   UPDATE [ListesPanel].[dbo].[RET2568_BURGER-KING_BaisseFrequentation]
       SET [DATE_CREDIT] = '13/03/2025';