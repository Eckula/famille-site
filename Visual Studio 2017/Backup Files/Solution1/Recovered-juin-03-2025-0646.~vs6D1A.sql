/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
      ,[numero_contrat]
      ,[date_souscription]
      ,[date_effet]
      ,[produit]
      ,[formule]
      ,[libelle_formule]
      ,[CANAL]
      ,[sexe]
      ,[nom]
      ,[prenom]
      ,[EMAIL]
      ,[date_naissance]
      ,[age]
      ,[top_detenteur_AUTO]
      ,[top_detenteur_MRH]
      ,[top_detenteur_PJ]
      ,[top_detenteur_AAV]
      ,[top_detenteur_SANTE]
      ,[CIBLE]
      ,[DATE_SOUS2]
      ,[VAGUE]
      ,[Formule_souscrite]
      ,[DATE_SOUS]
      ,[AGE1]
      ,[SEXE1]
      ,[SEGMENT]
      ,[LIB_SEXE]
      ,[TYPE_CONTRAT2]
      ,[Doublons]
  FROM [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [top_detenteur_AUTO] FLOAT;

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [top_detenteur_MRH] FLOAT;

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [top_detenteur_PJ] FLOAT;

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [top_detenteur_AAV] FLOAT;

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [top_detenteur_SANTE] FLOAT;

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [SEXE1] FLOAT;

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [AGE1] FLOAT;

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [Formule_souscrite] FLOAT;

ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro]
ALTER COLUMN [ID_ENOV] Bigint;
