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
      ,[LIB_TYPE_CONTRAT_2]
  FROM [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro_VF]
   
   select* 
   FROM [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro_VF]
   WHEre CIBLE = 'Auto'




ALTER TABLE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro_VF]
ALTER COLUMN LIB_TYPE_CONTRAT_2 NVARCHAR(255);

UPDATE [ListesExternes].[dbo].[BFA0182_SG_NveauxSouscrip_Baro_VF]
SET LIB_TYPE_CONTRAT_2 = CASE 
    WHEN LIB_TYPE_CONTRAT_2 = '1' THEN 'contrat d’assurance auto'
    WHEN LIB_TYPE_CONTRAT_2 = '2' THEN 'contrat d’assurance habitation'
    WHEN LIB_TYPE_CONTRAT_2 = '3' THEN 'assurance Accidents de la Vie'
    WHEN LIB_TYPE_CONTRAT_2 = '4' THEN 'contrat de Protection Juridique'
    WHEN LIB_TYPE_CONTRAT_2 = '5' THEN 'complémentaire Santé'
    ELSE LIB_TYPE_CONTRAT_2 -- on laisse la valeur inchangée si autre chose
END;



