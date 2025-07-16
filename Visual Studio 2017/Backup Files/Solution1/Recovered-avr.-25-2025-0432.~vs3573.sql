/* SI BESOIN DE SUPPRIMER LES VUES */
DROP VIEW [LISTE_UTILISEES]
DROP VIEW [CONTACT]

-- Déclarations des variables
DECLARE @ID_LISTE1   VARCHAR(MAX); 
DECLARE @ID_LISTE2   VARCHAR(MAX); 
DECLARE @ID_LISTE3   VARCHAR(MAX); 
DECLARE @ID_LISTE4   VARCHAR(MAX); 
DECLARE @ID_LISTE5   VARCHAR(MAX); 
DECLARE @ID_LISTE6   VARCHAR(MAX); 
DECLARE @ID_LISTE7   VARCHAR(MAX); 
DECLARE @ID_LISTE8   VARCHAR(MAX);

DECLARE @ID_ETUDE            VARCHAR(MAX);
DECLARE @EMAIL               VARCHAR(MAX);
DECLARE @NBENVOI             VARCHAR(MAX); 
DECLARE @LISTES              VARCHAR(MAX); 
DECLARE @NOMS_LISTES         VARCHAR(MAX); 
DECLARE @NUM_LISTES          VARCHAR(MAX); 
DECLARE @ENTETE_COLONNE1     VARCHAR(MAX);
DECLARE @ENTETE_COLONNE2     VARCHAR(MAX);
DECLARE @ENTETE_COLONNE2a    VARCHAR(MAX);
DECLARE @ENTETE_COLONNE3     VARCHAR(MAX);
DECLARE @ENTETE_COLONNE4     VARCHAR(MAX);
DECLARE @VIDE                VARCHAR(MAX);
DECLARE @VARIABLE_UTILISE    VARCHAR(MAX);

DECLARE @CONTACT_DISPO               VARCHAR(MAX);
DECLARE @MAIL_OUVERT_1               VARCHAR(MAX);  
DECLARE @MAIL_OUVERT_2               VARCHAR(MAX);  
DECLARE @MAIL_ENVOYE_1              VARCHAR(MAX);
DECLARE @MAIL_ENVOYE_2              VARCHAR(MAX);
DECLARE @Q_COMMENCE_1               VARCHAR(MAX);
DECLARE @Q_COMMENCE_2               VARCHAR(MAX);
DECLARE @Q_TERMINE_1                VARCHAR(MAX);
DECLARE @Q_TERMINE_2                VARCHAR(MAX);
DECLARE @Q_ERREUR                   VARCHAR(MAX);
DECLARE @Q_ERREUR_1                 VARCHAR(MAX);
DECLARE @Q_ERREUR_2                 VARCHAR(MAX);
DECLARE @Q_HORS_CIBLE_1             VARCHAR(MAX);
DECLARE @Q_HORS_CIBLE_2             VARCHAR(MAX);
DECLARE @Q_ABANDON_1                VARCHAR(MAX);
DECLARE @Q_ABANDON_2                VARCHAR(MAX);
DECLARE @CONTACT_DISPO_PAR_MAIL      VARCHAR(MAX);
DECLARE @MAIL_OUVERT_1_PAR_MAIL      VARCHAR(MAX);  
DECLARE @MAIL_OUVERT_2_PAR_MAIL      VARCHAR(MAX);  
DECLARE @MAIL_ENVOYE_1_PAR_MAIL      VARCHAR(MAX);
DECLARE @MAIL_ENVOYE_2_PAR_MAIL      VARCHAR(MAX);
DECLARE @Q_COMMENCE_1_PAR_MAIL       VARCHAR(MAX);
DECLARE @Q_COMMENCE_2_PAR_MAIL       VARCHAR(MAX);
DECLARE @Q_TERMINE_1_PAR_MAIL        VARCHAR(MAX);
DECLARE @Q_TERMINE_2_PAR_MAIL        VARCHAR(MAX);
DECLARE @Q_ERREUR_PAR_MAIL           VARCHAR(MAX);
DECLARE @Q_ERREUR_1_PAR_MAIL         VARCHAR(MAX);
DECLARE @Q_ERREUR_2_PAR_MAIL         VARCHAR(MAX);
DECLARE @Q_HORS_CIBLE_1_PAR_MAIL     VARCHAR(MAX);
DECLARE @Q_HORS_CIBLE_2_PAR_MAIL     VARCHAR(MAX);
DECLARE @Q_ABANDON_2_PAR_MAIL        VARCHAR(MAX);
DECLARE @Q_ABANDON_1_PAR_MAIL        VARCHAR(MAX);

DECLARE @MAIL_OUVERT_1_PAR_DATE      VARCHAR(MAX);  
DECLARE @MAIL_OUVERT_2_PAR_DATE      VARCHAR(MAX);  
DECLARE @MAIL_ENVOYE_1_PAR_DATE      VARCHAR(MAX);
DECLARE @MAIL_ENVOYE_2_PAR_DATE      VARCHAR(MAX);
DECLARE @Q_COMMENCE_1_PAR_DATE       VARCHAR(MAX);
DECLARE @Q_COMMENCE_2_PAR_DATE       VARCHAR(MAX);
DECLARE @Q_TERMINE_1_PAR_DATE        VARCHAR(MAX);
DECLARE @Q_TERMINE_2_PAR_DATE        VARCHAR(MAX);
DECLARE @Q_ERREUR_PAR_DATE           VARCHAR(MAX);
DECLARE @Q_ERREUR_1_PAR_DATE         VARCHAR(MAX);
DECLARE @Q_ERREUR_2_PAR_DATE         VARCHAR(MAX);
DECLARE @Q_HORS_CIBLE_1_PAR_DATE     VARCHAR(MAX);
DECLARE @Q_HORS_CIBLE_2_PAR_DATE     VARCHAR(MAX);
DECLARE @Q_ABANDON_2_PAR_DATE        VARCHAR(MAX);
DECLARE @Q_ABANDON_1_PAR_DATE        VARCHAR(MAX);
DECLARE @VIEW1                     VARCHAR(MAX);
DECLARE @VIEW2                     VARCHAR(MAX);
DECLARE @DETAIL_MAILING            VARCHAR(MAX);
DECLARE @NOMETUDE                  VARCHAR(MAX);
DECLARE @ETUDE                     VARCHAR(MAX);
DECLARE @PAR_LISTE                 VARCHAR(MAX); 
DECLARE @PAR_LISTE_NOM             VARCHAR(MAX); 
DECLARE @BOITE_MAIL                VARCHAR(MAX); 
DECLARE @BOITE_MAIL_NOM            VARCHAR(MAX); 
DECLARE @ENTETE_COLONNE_MAIL       VARCHAR(MAX); 
DECLARE @ENTETE_COLONNE_DATE       VARCHAR(MAX); 
DECLARE @CONTACT_DISPO_PAR_DATE    VARCHAR(MAX); 
DECLARE @DATE                      VARCHAR(MAX); 
DECLARE @DATE_NOM                  VARCHAR(MAX); 

/* A METTRE A JOUR ICI */
/* (A MODIFIER) 1- 
   - NOM DE L'ETUDE POUR LE SUIVI
   - NOM DU CHAMP 'EMAIL' DANS LES LISTES
   - LES IDS DES DIFFERENTES LISTES EN SUPERVISION – Adapter en fonction du nombre de listes existantes !
*/
SET @NOMETUDE = 'RET2570_BUT_ProfilingClients';
SET @PAR_LISTE = '[12057],[12267],[12268],[12269],[12270],[12271],[12273],[12274]';
SET @PAR_LISTE_NOM = '''RET2570_BUT_ProfilingClients_PANEL_V2'',''RET2570_BUT_ProfilingClients_CLIENT_LOT1'',''RET2570_BUT_ProfilingClients_CLIENT_LOT2'',''RET2570_BUT_ProfilingClients_CLIENT_LOT3'',''RET2570_BUT_ProfilingClients_CLIENT_LOT4'',''RET2570_BUT_ProfilingClients_CLIENT_LOT5'',''RET2570_BUT_ProfilingClients_CLIENT_LOT6'',''RET2570_BUT_ProfilingClients_CLIENT_LOT7''';

SET @BOITE_MAIL = '[gmail.com],[orange.fr],[hotmail.fr],[yahoo.fr],[hotmail.com],[wanadoo.fr],[laposte.net],[sfr.fr],[outlook.fr],[icloud.com],[free.fr],[live.fr],[yahoo.com],[neuf.fr],[outlook.com],[aol.com]';
SET @BOITE_MAIL_NOM = '''[gmail.com]'',''[orange.fr]'',''[hotmail.fr]'',''[yahoo.fr]'',''[hotmail.com]'',''[wanadoo.fr]'',''[laposte.net]'',''[sfr.fr]'',''[outlook.fr]'',''[icloud.com]'',''[free.fr]'',''[live.fr]'',''[yahoo.com]'',''[neuf.fr]'',''[outlook.com]'',''[aol.com]''';
SET @EMAIL = 'EMAIL';
SET @DATE = '[2025-04-16],[2025-04-17],[2025-04-18],[2025-04-19],[2025-04-20],[2025-04-21],[2025-04-22],[2025-04-23],[2025-04-24],[2025-04-25],[2025-04-26],[2025-04-27],[2025-04-28],[2025-04-29],[2025-04-30],[2025-05-01],[2025-05-02],[2025-05-03],[2025-05-04],[2025-05-05],[2025-05-06],[2025-05-07],[2025-05-08],[2025-05-09],[2025-05-10],[2025-05-11],[2025-05-12],[2025-05-13],[2025-05-14],[2025-05-15],[2025-05-16]';
SET @DATE_NOM = '''[2025-04-16]'',''[2025-04-17]'',''[2025-04-18]'',''[2025-04-19]'',''[2025-04-20]'',''[2025-04-21]'',''[2025-04-22]'',''[2025-04-23]'',''[2025-04-24]'',''[2025-04-25]'',''[2025-04-26]'',''[2025-04-27]'',''[2025-04-28]'',''[2025-04-29]'',''[2025-04-30]'',''[2025-05-01]'',''[2025-05-02]'',''[2025-05-03]'',''[2025-05-04]'',''[2025-05-05]'',''[2025-05-06]'',''[2025-05-07]'',''[2025-05-08]'',''[2025-05-09]'',''[2025-05-10]'',''[2025-05-11]'',''[2025-05-12]'',''[2025-05-13]'',''[2025-05-14]'',''[2025-05-15]'',''[2025-05-16]''';

-- Affectation des IDs des listes utilisées
SET @ID_LISTE1 = '12057';
SET @ID_LISTE2 = '12267';
SET @ID_LISTE3 = '12268';
SET @ID_LISTE4 = '12269';
SET @ID_LISTE5 = '12270';
SET @ID_LISTE6 = '12271';
SET @ID_LISTE7 = '12273';
SET @ID_LISTE8 = '12274';

/* (A MODIFIER) 2- 
   SUPPRIMER LES "UNIONS SELECT ..." CORRESPONDANT A DES LISTES QUI N'EXISTENT PAS.
*/
SET @VIEW1 = 'CREATE VIEW [CONTACT] AS 
SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],
       [AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],
       [AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority],
       ' + @ID_LISTE1 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE1 + '] 
UNION 
SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],
       [AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],
       [AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority],
       ' + @ID_LISTE2 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE2 + ']
UNION 
SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],
       [AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],
       [AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority],
       ' + @ID_LISTE3 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE3 + ']
UNION 
SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],
       [AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],
       [AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority],
       ' + @ID_LISTE4 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE4 + ']
UNION 
SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],
       [AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],
       [AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority],
       ' + @ID_LISTE5 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE5 + ']
UNION 
SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],
       [AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],
       [AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority],
       ' + @ID_LISTE6 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE6 + ']
UNION 
SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],
       [AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],
       [AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority],
       ' + @ID_LISTE7 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE7 + ']
UNION 
SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],
       [AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],
       [AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority],
       ' + @ID_LISTE8 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE8 + ']';

SET @VIEW2 = 'CREATE VIEW [LISTE_UTILISEES] AS 
SELECT *, ' + @ID_LISTE1 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE1 + '] 
UNION 
SELECT *, ' + @ID_LISTE2 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE2 + '] 
UNION 
SELECT *, ' + @ID_LISTE3 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE3 + '] 
UNION 
SELECT *, ' + @ID_LISTE4 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE4 + '] 
UNION 
SELECT *, ' + @ID_LISTE5 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE5 + '] 
UNION 
SELECT *, ' + @ID_LISTE6 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE6 + '] 
UNION 
SELECT *, ' + @ID_LISTE7 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE7 + '] 
UNION 
SELECT *, ' + @ID_LISTE8 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE8 + ']';

/* (A MODIFIER) 3- 
   - ID DE L'ETUDE
   - LES DATES D'ENVOI SI UTILISEES
   - LES ID DES LISTES (uniquement celles utilisées)
   - LES NOMS DES LISTES (adapter le nombre)
*/
SET @ID_ETUDE = '4529';
SET @NBENVOI = '';
SET @LISTES = ' [' + @ID_LISTE1 + ']
, [' + @ID_LISTE2 + ']
, [' + @ID_LISTE3 + ']
, [' + @ID_LISTE4 + ']
, [' + @ID_LISTE5 + ']
, [' + @ID_LISTE6 + ']
, [' + @ID_LISTE7 + ']
, [' + @ID_LISTE8 + ']';

SET @NUM_LISTES = '''' + @ID_LISTE1 + '''
,''' + @ID_LISTE2 + '''
,''' + @ID_LISTE3 + '''
,''' + @ID_LISTE4 + '''
,''' + @ID_LISTE5 + '''
,''' + @ID_LISTE6 + '''
,''' + @ID_LISTE7 + '''
,''' + @ID_LISTE8 + '''';

SET @NOMS_LISTES = '''RET2570_BUT_ProfilingClients_PANEL_V2''
,''RET2570_BUT_ProfilingClients_CLIENT_LOT1''
,''RET2570_BUT_ProfilingClients_CLIENT_LOT2''
,''RET2570_BUT_ProfilingClients_CLIENT_LOT3''
,''RET2570_BUT_ProfilingClients_CLIENT_LOT4''
,''RET2570_BUT_ProfilingClients_CLIENT_LOT5''
,''RET2570_BUT_ProfilingClients_CLIENT_LOT6''
,''RET2570_BUT_ProfilingClients_CLIENT_LOT7''';

-- Exécution de la création des vues
EXEC (@VIEW1);
EXEC (@VIEW2);

/* CREATION DES REQUETES */

SET @CONTACT_DISPO = '
SET NOCOUNT ON
SELECT ''CONTACTS DISPO'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [CONTACT]) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @MAIL_ENVOYE_1 = '
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - MAIL 1'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState=0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @MAIL_OUVERT_1 = '
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - MAIL 1'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastReadTimeUTC IS NOT NULL AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @Q_COMMENCE_1 = '
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResponseTimeUTC IS NOT NULL AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @Q_TERMINE_1 = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @Q_HORS_CIBLE_1 = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=1005 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @Q_ERREUR_1 = '
SET NOCOUNT ON;
SELECT ''ECHEC_ENVOI - MAIL 1'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState>0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @MAIL_ENVOYE_2 = '
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - RELANCES'',' + @PAR_LISTE + '
FROM
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState=0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @MAIL_OUVERT_2 = '
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - RELANCES'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastReadTimeUTC IS NOT NULL AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @Q_COMMENCE_2 = '
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResponseTimeUTC IS NOT NULL AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @Q_TERMINE_2 = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - RELANCES'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @Q_HORS_CIBLE_2 = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=1005 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @Q_ERREUR_2 = '
SET NOCOUNT ON;
SELECT ''ECHEC ENVOI - RELANCES'',' + @PAR_LISTE + '
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState>0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @PAR_LISTE + ')) AS Tab2';

SET @MAIL_ENVOYE_1_PAR_DATE = '
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - MAIL 1 (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState=0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @MAIL_OUVERT_1_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - MAIL 1 (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastReadTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastReadTimeUTC IS NOT NULL AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @Q_COMMENCE_1_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1 (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResponseTimeUTC IS NOT NULL AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @Q_TERMINE_1_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1 (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @Q_HORS_CIBLE_1_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1 (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastResponseUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=1005 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @Q_ERREUR_1_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''ECHEC ENVOI - MAIL 1 (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastResponseUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState>0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @MAIL_ENVOYE_2_PAR_DATE = '
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - RELANCES (par date)'',' + @DATE + '
FROM
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState=0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @MAIL_OUVERT_2_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - RELANCES (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastReadTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastReadTimeUTC IS NOT NULL AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @Q_COMMENCE_2_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResponseTimeUTC IS NOT NULL AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @Q_TERMINE_2_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - RELANCES'',' + @DATE + '
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @Q_HORS_CIBLE_2_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=1005 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @Q_ERREUR_2_PAR_DATE = '
SET NOCOUNT ON;
SELECT ''ECHEC ENVOI - RELANCES (par date)'',' + @DATE + '
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState>0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @DATE + ')) AS Tab2';

SET @CONTACT_DISPO_PAR_MAIL = '
SET NOCOUNT ON
SELECT ''CONTACTS DISPO (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN EMAIL LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN EMAIL LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN EMAIL LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN EMAIL LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN EMAIL LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN EMAIL LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN EMAIL LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN EMAIL LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN EMAIL LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN EMAIL LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN EMAIL LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN EMAIL LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN EMAIL LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN EMAIL LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN EMAIL LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN EMAIL LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [CONTACT]) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @MAIL_ENVOYE_1_PAR_MAIL = '
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - MAIL 1 (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState=0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @MAIL_OUVERT_1_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - MAIL 1 (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastReadTimeUTC IS NOT NULL AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @Q_COMMENCE_1_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1 (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResponseTimeUTC IS NOT NULL AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @Q_TERMINE_1_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1 (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @Q_HORS_CIBLE_1_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1 (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=1005 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @Q_ERREUR_1_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''ECHEC ENVOI - MAIL 1 (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState>0 AND AskType=0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @MAIL_ENVOYE_2_PAR_MAIL = '
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - RELANCES (detail par boite mail)'',' + @BOITE_MAIL + '
FROM
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState=0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @MAIL_OUVERT_2_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - RELANCES (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastReadTimeUTC IS NOT NULL AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @Q_COMMENCE_2_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResponseTimeUTC IS NOT NULL AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @Q_TERMINE_2_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - RELANCES (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @Q_HORS_CIBLE_2_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE LastResult=1005 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @Q_ERREUR_2_PAR_MAIL = '
SET NOCOUNT ON;
SELECT ''ECHEC ENVOI - RELANCES (detail par boite mail)'',' + @BOITE_MAIL + '
FROM   
(SELECT  
 (CASE 
    WHEN AskEmail LIKE ''%gmail.com%'' THEN ''gmail.com''
    WHEN AskEmail LIKE ''%orange.fr%'' THEN ''orange.fr''
    WHEN AskEmail LIKE ''%hotmail.fr%'' THEN ''hotmail.fr''
    WHEN AskEmail LIKE ''%yahoo.fr%'' THEN ''yahoo.fr''
    WHEN AskEmail LIKE ''%hotmail.com%'' THEN ''hotmail.com''
    WHEN AskEmail LIKE ''%wanadoo.fr%'' THEN ''wanadoo.fr''
    WHEN AskEmail LIKE ''%laposte.net%'' THEN ''laposte.net''
    WHEN AskEmail LIKE ''%sfr.fr%'' THEN ''sfr.fr''
    WHEN AskEmail LIKE ''%outlook.fr%'' THEN ''outlook.fr''
    WHEN AskEmail LIKE ''%icloud.com%'' THEN ''icloud.com''
    WHEN AskEmail LIKE ''%free.fr%'' THEN ''free.fr''
    WHEN AskEmail LIKE ''%live.fr%'' THEN ''live.fr''
    WHEN AskEmail LIKE ''%yahoo.com%'' THEN ''yahoo.com''
    WHEN AskEmail LIKE ''%neuf.fr%'' THEN ''neuf.fr''
    WHEN AskEmail LIKE ''%outlook.com%'' THEN ''outlook.com''
    WHEN AskEmail LIKE ''%aol.com%'' THEN ''aol.com''
    ELSE ''autre''
  END) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] WHERE AskState>0 AND AskType>0) AS tab1
PIVOT  
(Count(AskInterview)
FOR V_SEGMENTATION IN (' + @BOITE_MAIL + ')) AS Tab2';

SET @DETAIL_MAILING = '
SET NOCOUNT ON
SELECT [Type] AS ''N° email'', (CAST([Time] AS DATE)) AS Date, [ListId] AS ''Liste'', [Sender] AS ''Expediteur'',
       [Subject] AS ''Sujet'', COUNT(MailId) AS ''Nb mail envoyés''
FROM [Askia_Statistics].[dbo].[Statistic_Mail] 
WHERE Surveyid=' + @ID_ETUDE + ' AND [Type]>=0  
GROUP BY [Type], (CAST([Time] AS DATE)), ListId, Sender, Subject
ORDER BY (CAST([Time] AS DATE))';

  
/* MISE EN FORME */
SET @ETUDE = 'SET NOCOUNT ON; SELECT ''' + @NOMETUDE + '''';
SET @ENTETE_COLONNE1 = 'SET NOCOUNT ON; SELECT ''DATE ENVOI'',''NB MAIL ENVOYES'',''N° EMAIL''';
SET @ENTETE_COLONNE2 = 'SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @PAR_LISTE_NOM;
SET @ENTETE_COLONNE3 = 'SET NOCOUNT ON; SELECT ''INFOS COMPLEMENTAIRE''';
SET @ENTETE_COLONNE4 = 'SET NOCOUNT ON; SELECT ''N° EMAIL'',''DATE'',''LISTE'',''EXPEDITEUR'',''OBJET'',''NB EMAILS ENVOYES''';
SET @VIDE = 'SET NOCOUNT ON; SELECT '' ''';
SET @ENTETE_COLONNE_MAIL = 'SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @BOITE_MAIL_NOM;
SET @ENTETE_COLONNE_DATE = 'SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @DATE_NOM;

/* EXECUTION */
EXEC (@ETUDE);
EXEC (@VIDE);
EXEC (@ENTETE_COLONNE2a);  -- Cette variable reste inchangée si elle est définie ailleurs
EXEC (@ENTETE_COLONNE2);
EXEC (@CONTACT_DISPO);
EXEC (@MAIL_ENVOYE_1);
EXEC (@MAIL_OUVERT_1);
EXEC (@Q_COMMENCE_1);
EXEC (@Q_TERMINE_1);
EXEC (@Q_HORS_CIBLE_1);
EXEC (@Q_ABANDON_1);  -- Si définie
EXEC (@Q_ERREUR_1);
EXEC (@MAIL_ENVOYE_2);
EXEC (@MAIL_OUVERT_2);
EXEC (@Q_COMMENCE_2);
EXEC (@Q_TERMINE_2);
EXEC (@Q_HORS_CIBLE_2);
EXEC (@Q_ABANDON_2);  -- Si définie
EXEC (@Q_ERREUR_2);
EXEC (@VIDE);
EXEC (@ENTETE_COLONNE_MAIL);
EXEC (@CONTACT_DISPO_PAR_MAIL);
EXEC (@MAIL_ENVOYE_1_PAR_MAIL);
EXEC (@MAIL_OUVERT_1_PAR_MAIL);
EXEC (@Q_COMMENCE_1_PAR_MAIL);
EXEC (@Q_TERMINE_1_PAR_MAIL);
EXEC (@Q_HORS_CIBLE_1_PAR_MAIL);
EXEC (@Q_ABANDON_1_PAR_MAIL);  -- Si définie
EXEC (@Q_ERREUR_1_PAR_MAIL);
EXEC (@MAIL_ENVOYE_2_PAR_MAIL);
EXEC (@MAIL_OUVERT_2_PAR_MAIL);
EXEC (@Q_COMMENCE_2_PAR_MAIL);
EXEC (@Q_TERMINE_2_PAR_MAIL);
EXEC (@Q_HORS_CIBLE_2_PAR_MAIL);
EXEC (@Q_ABANDON_2_PAR_MAIL);  -- Si définie
EXEC (@Q_ERREUR_2_PAR_MAIL);
EXEC (@VIDE);
EXEC (@ENTETE_COLONNE_DATE);
EXEC (@MAIL_ENVOYE_1_PAR_DATE);
EXEC (@MAIL_OUVERT_1_PAR_DATE);
EXEC (@Q_COMMENCE_1_PAR_DATE);
EXEC (@Q_TERMINE_1_PAR_DATE);
EXEC (@Q_HORS_CIBLE_1_PAR_DATE);
EXEC (@Q_ABANDON_1_PAR_DATE);  -- Si définie
EXEC (@Q_ERREUR_1_PAR_DATE);
EXEC (@MAIL_ENVOYE_2_PAR_DATE);
EXEC (@MAIL_OUVERT_2_PAR_DATE);
EXEC (@Q_COMMENCE_2_PAR_DATE);
EXEC (@Q_TERMINE_2_PAR_DATE);
EXEC (@Q_HORS_CIBLE_2_PAR_DATE);
EXEC (@Q_ABANDON_2_PAR_DATE);  -- Si définie
EXEC (@Q_ERREUR_2_PAR_DATE);
EXEC (@VIDE);
EXEC (@ENTETE_COLONNE3);
EXEC (@ENTETE_COLONNE4);
EXEC (@DETAIL_MAILING);
