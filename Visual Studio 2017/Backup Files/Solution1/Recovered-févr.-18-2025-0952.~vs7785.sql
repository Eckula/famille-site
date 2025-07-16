/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (15000) [Identifiant_Contact]
      ,[ID_MYCONSOO]
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
      ,[Date_de_creation]
      ,[Dernier_Magasin]
      ,[NB_VISITE]
      ,[NB_PROD]
      ,[RECENCE]
      ,[Rayon]
	  ,[CIBLE]
  FROM [ListesPanel].[dbo].[RET2570_BUT_ProfilingClients_PANEL]


 ALTER TABLE [ListesPanel].[dbo].[RET2570_BUT_ProfilingClients_PANEL]
 ADD [CIBLE] NVARCHAR(255);


   UPDATE [ListesPanel].[dbo].[RET2570_BUT_ProfilingClients_PANEL]
  SET [CIBLE] = '1';


   ALTER TABLE [ListesPanel].[dbo].[RET2570_BUT_ProfilingClients_PANEL]
    ALTER COLUMN [DATE_CREDIT] NVARCHAR(255);

	 ALTER TABLE [ListesPanel].[dbo].[RET2570_BUT_ProfilingClients_PANEL]
     ALTER COLUMN [CIBLE] float;

	   UPDATE [ListesPanel].[dbo].[RET2570_BUT_ProfilingClients_PANEL]
       SET [DATE_CREDIT] = '06/03/2025';

