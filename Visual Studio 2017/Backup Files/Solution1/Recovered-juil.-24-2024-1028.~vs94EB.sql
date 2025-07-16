/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
      ,[RS1bis_Type_NAOMI]
      ,[Civilite]
      ,[Nom]
      ,[Prenom]
      ,[Mail]
      ,[RS3_Date_de_voyage]
      ,[RS5_Transporteur_1]
      ,[RS6_Transporteur_2]
	  ,[Region_TER]
  FROM [ListesExternes].[dbo].[TSP1818_SNCF_VOYAGEURS_LAB_Parcours_client_MT]

 ALTER TABLE [ListesExternes].[dbo].[TSP1818_SNCF_VOYAGEURS_LAB_Parcours_client_MT]
  ADD [Region_TER] NVARCHAR(255);