/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID_ENOV]
      ,[Identifiant cadre]
      ,[TYPE_CONTACT]
      ,[Civilité]
      ,[SEXE]
      ,[NOM]
      ,[PRENOM]
      ,[EMAIL]
      ,[TELEPHONE]
      ,[Date de naissance]
      ,[Tranche d'âge]
      ,[AGE_REC]
      ,[Code postal]
      ,[Pays]
      ,[Géographie - Regroupement 2]
      ,[Délégation Régionale]
      ,[Zone rurale]
      ,[QPV]
      ,[Regroupement secteur d'activité]
      ,[Regroupement fonction]
      ,[Fonction]
      ,[Date de première consommation/action]
      ,[Date de dernière consommation/action]
      ,[Date de postulation]
      ,[STATUT_ALA_CREATION]
      ,[Situation en entrée du parcours-service]
      ,[Modalité du parcours-service]
      ,[Service/Parcours]
      ,[Type de conseil]
      ,[Statut du parcours-service]
      ,[Temps Apec conseil individuel du parcours-service]
      ,[Total Temps client passé avec l’APEC du parcours-service]
      ,[Aiguillage]
      ,[Statut de la candidature]
      ,[Type de candidature]
      ,[Cycle de vie "Connexion"]
      ,[Abonné au push offres (O/N)]
      ,[Profil publié (O/N)]
      ,[Abonné à une newsletter (O/N)]
      ,[Situation du compte]
      ,[Sollicitable]
  FROM [ListesExternes].[dbo].[DSE0045_APEC_DevenirClients18mois]


  SELECT 
    blocking_session_id AS BloqueParSession,
    session_id AS MaSession,
    wait_type,
    wait_time,
    last_wait_type,
    status,
    command,
    text AS requete_en_cours
FROM sys.dm_exec_requests
CROSS APPLY sys.dm_exec_sql_text(sql_handle)
WHERE blocking_session_id <> 0;

SELECT 
    s.session_id,
    r.status,
    r.command,
    r.wait_type,
    t.text AS requete_en_cours
FROM sys.dm_exec_requests r
JOIN sys.dm_exec_sessions s ON r.session_id = s.session_id
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE s.session_id = 128;


KILL 128;


EXEC sp_rename 
    N'[ListesExternes].[dbo].[DSE0045_APEC_DevenirClients18mois].[Cycle de vie "Connexion"]', 
    N'CycleDeVieConnexion', 
    'COLUMN';

	EXEC sp_rename 
    N'DSE0045_APEC_DevenirClients18mois.[Cycle de vie "Connexion"]', 
    N'CycleDeVieConnexion', 
    'COLUMN';


	SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'DSE0045_APEC_DevenirClients18mois';

EXEC sp_rename 
    N'dbo.DSE0045_APEC_DevenirClients18mois.[Cycle de vie ""Connexion""]', 
    N'CycleDeVieConnexion', 
    'COLUMN';

