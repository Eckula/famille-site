/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (10000) [ID_ENOV]
      ,[Email_Address]
      ,[TYPE_ENERGIE]
      ,[LB_CONT]
      ,[Civilite]
      ,[PRENOM]
      ,[NOM]
      ,[Address 1]
      ,[Address 2]
      ,[VILLE]
      ,[Zip or Postal Code]
      ,[CODE_DPT]
      ,[UDA5]
      ,[UDA9]
      ,[LIB_UDA5]
  FROM [ListesExternes].[dbo].[ENE0091_ENGIE_PostTestMagazine$]


  ListesExternes