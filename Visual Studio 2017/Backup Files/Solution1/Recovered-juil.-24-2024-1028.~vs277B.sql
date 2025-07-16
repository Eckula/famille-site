/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
      ,[Email_Address]
      ,[TYPE_ENERGIE]
      ,[Civilite]
      ,[PRENOM]
      ,[NOM]
      ,[FL_CONS_ENGI_PRDT_ANLG]
      ,[FL_STOP_EMLN]
      ,[Mobile Phone]
      ,[Address 1]
      ,[Address 2]
      ,[VILLE]
      ,[Zip or Postal Code]
      ,[CODE_DPT]
      ,[UDA5]
      ,[UDA9]
      ,[AUTRES_TYPE_ENERGIE]
  FROM [ListesExternes].[dbo].[ENE0081_ENGIE_PostTestMagazine]

  SELECT* FROM [ListesExternes].[dbo].[ENE0081_ENGIE_PostTestMagazine]
  WHERE [AUTRES_TYPE_ENERGIE] not like '%HORS_CIBLE%' and [Email_Address] no null;

  SELECT * 
FROM [ListesExternes].[dbo].[ENE0081_ENGIE_PostTestMagazine]
WHERE [AUTRES_TYPE_ENERGIE] NOT LIKE '%HORS_CIBLE%' AND [Email_Address] IS NOT NULL;
