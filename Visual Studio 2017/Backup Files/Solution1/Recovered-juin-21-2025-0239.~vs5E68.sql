/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
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
  FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]


  ALTER TABLE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
  ADD MODE_SOLLICITATION INT;

  ALTER TABLE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
  ADD ID_ENOV INT;
  
 /* 1) Adapter le type de la colonne                                     */
ALTER TABLE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
ALTER COLUMN CODE_DPT NVARCHAR(5) NULL;   -- ou NOT NULL selon ton besoin



SELECT ID_ENOV, COUNT(*) AS Nb_occurrences
FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
GROUP BY ID_ENOV
HAVING COUNT(*) > 1;
