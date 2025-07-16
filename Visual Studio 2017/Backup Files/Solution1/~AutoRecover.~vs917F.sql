/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (800000) [ID_ENOV]
      ,[Fichier d'origine]
      ,[ContactID]
      ,[First and Last Name]
      ,[Mode de sollicitation]
      ,[EMAIL]
      ,[CODE_DEPT]
      ,[UDA5]
      ,[TRANCHE_AGE]
      ,[CLIENT PREDORMANT OU DORMANT]
      ,[LB_CONT]
      ,[Mobile Phone]
      ,[KO_CNTC_TEL_PORT]
      ,[KO_CNTC_EMAIL]
      ,[SmsOptIn (App_v1)]
      ,[SMS Opt-out]
      ,[FL_STOP_MAILING]
      ,[FL_STOP_PHONING]
      ,[TYPE_ENERGIE]
      ,[CODE_DPT]
      ,[UDA51]
      ,[UDA9]
      ,[LIB_UDA5]
      ,[PRENOM]
      ,[NOM]
      ,[TELEPHONE]
      ,[MODE_SOLLICITATION]
  FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]


  SELECT TOP 0 * INTO dbo.ENEO115_stg  FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
-- puis ALTER chaque colonne en NVARCHAR(MAX)

SELECT UDA5, COUNT(*)        -- ou CODE_DPT
FROM   dbo.ENEO115_stg
WHERE  TRY_CONVERT(tinyint, UDA5) IS NULL
GROUP BY UDA5;

/* a) table provisoire 100 % texte */
SELECT TOP 0 * 
INTO   dbo.ENE0115_stg
FROM   dbo.ENE0115_ENGIE_PostTestMagazine;
GO
EXEC sp_msforeachcolumn 
     'ALTER TABLE dbo.ENE0115_stg 
      ALTER COLUMN ? NVARCHAR(MAX) NULL';

	  TRUNCATE TABLE FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine];  -- vide tout
/* puis relance ton import : zéro doublon possible */

SELECT ID_ENOV, COUNT(*) AS Nb_occurrences
FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
GROUP BY ID_ENOV
HAVING COUNT(*) > 1;



SELECT SUM(Nb_occurrences - 1) AS Total_doublons
FROM (
    SELECT COUNT(*) AS Nb_occurrences
    FROM [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
    GROUP BY ID_ENOV
    HAVING COUNT(*) > 1
) AS doublons;



TRUNCATE TABLE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine];



  ALTER TABLE [ListesExternes].[dbo].[BFA0170_MGEN_BaroSatglo_Juillet2025]
   ADD Relance1 NVARCHAR(500),
    Invitation SMS NVARCHAR(500),
    Invitation tirage au sort NVARCHAR(500);


	ALTER TABLE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
ADD Relance1 NVARCHAR(500),
    Invitation_SMS NVARCHAR(500),
    Invitation_Tirage_Au_Sort NVARCHAR(500);

ALTER TABLE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
ALTER COLUMN Relance1 FLOAT;

ALTER TABLE [ListesExternes].[dbo].[ENE0115_ENGIE_PostTestMagazine]
ALTER COLUMN Invitation_SMS FLOAT;
