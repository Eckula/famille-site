/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT *
  
   FROM [Enov].[dbo].[ListeNoire]

SELECT *
  FROM [Enov].[dbo].[ListeNoire]
  WHERE [Raison]  LIKE 'BFA0121_MGEN_Baro_sat_global_2024_avril';
  

  SELECT *
  FROM [Enov].[dbo].[ListeNoire]
  WHERE [Raison]  LIKE 'BFA0122_MGEN_BaroMiroir';


   SELECT *
  FROM [Enov].[dbo].[ListeNoire]
  WHERE [Raison]  LIKE '%BFA0121%'


   SELECT *
  FROM [Enov].[dbo].[ListeNoire]
  WHERE [Raison]  LIKE '%BFA0122%'