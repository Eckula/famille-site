/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (10000000) [ID_ENOV]
      ,[CODE_ACTION]
      ,[SOURCE]
      ,[SOURCE_EXPLICATION_AC]
      ,[EMAIL]
      ,[EMAIL_COMPT_AC]
      ,[TEL_PORT_PRIO_1]
      ,[PORT_COMP_AC]
      ,[COMP_F]
      ,[ID_PERSONNE]
      ,[ID_CONTRAT]
      ,[ID_BP_SYMPH]
      ,[ID_LOCAL]
      ,[CIVILITE]
      ,[CONTACT]
      ,[NOM]
      ,[PRENOM]
      ,[ANCIENNETE_LOCAL]
      ,[TYPE_RESIDENCE]
      ,[STATUT_OCCUPATION]
      ,[ENERGIE_LOCAL]
      ,[MODE_CHAUFFAGE]
      ,[DATE_RECV_PROCH_FACTU]
      ,[DATE_SOUS]
      ,[FREQUENCE_FACTURATION]
      ,[CANAL_VENTE_PC]
      ,[DATA_SOUS_CEL]
      ,[DATA_SOUS_FEL]
      ,[DATE_DEBUT]
      ,[DATE_FIN]
      ,[NO_VOIE]
      ,[LIB_VOIE]
      ,[COD_POSTAL]
      ,[COMMUNE]
      ,[DATE_EMMENAGE_LOCAL]
  FROM [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]

  DELETE FROM [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
WHERE ID_ENOV = '1';

ALTER TABLE [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
ALTER COLUMN [ID_ENOV] BIGINT;

ALTER TABLE [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
ALTER COLUMN [ANCIENNETE_LOCAL] nvarchar(255);

ALTER TABLE [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
ALTER COLUMN [COD_POSTAL] nvarchar(255);

SELECT * FROM [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec] WHERE TRY_CAST([ANCIENNETE_LOCAL] 
AS FLOAT) IS NULL AND [ANCIENNETE_LOCAL] IS NOT NULL;

ALTER TABLE [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
ALTER COLUMN [ANCIENNETE_LOCAL] NVARCHAR(255);

SELECT [ANCIENNETE_LOCAL]
FROM [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
WHERE TRY_CAST([ANCIENNETE_LOCAL] AS FLOAT) IS NULL AND [ANCIENNETE_LOCAL] IS NOT NULL;

SELECT COUNT(*) AS Nombre_Valeurs_Nulles
FROM [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
WHERE [ANCIENNETE_LOCAL] IS NULL;

SELECT COUNT(*) AS Nombre_Valeurs_Vides
FROM [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
WHERE [ANCIENNETE_LOCAL] = '';

SELECT *
FROM [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
WHERE TRY_CAST(ANCIENNETE_LOCAL AS FLOAT) IS NULL
AND ANCIENNETE_LOCAL IS NOT NULL;

ALTER TABLE [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
ALTER COLUMN ANCIENNETE_LOCAL FLOAT;


ALTER TABLE [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
ALTER COLUMN [COD_POSTAL] NVARCHAR(510);

UPDATE [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
SET [COD_POSTAL] = CAST([COD_POSTAL] AS NVARCHAR(510));

ALTER TABLE [ListesExternes].[dbo].[ENE0097_ENGIE_Post_test_CourrierOffreElec]
ALTER COLUMN [COD_POSTAL] NVARCHAR(255);

