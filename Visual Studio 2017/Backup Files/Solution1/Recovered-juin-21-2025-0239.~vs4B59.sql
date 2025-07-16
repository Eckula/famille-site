/*SI BESOIN DE SUPPRIMER LES VUES

*/
DROP VIEW IF EXISTS dbo.CONTACT;
DROP VIEW IF EXISTS dbo.LISTE_UTILISEES;

declare @ID_LISTE1 VARCHAR(max); 
declare @ID_LISTE2 VARCHAR(max); 
declare @ID_LISTE3 VARCHAR(max); 
declare @ID_LISTE4 VARCHAR(max); 
declare @ID_LISTE5 VARCHAR(max); 
declare @ID_LISTE6 VARCHAR(max); 
declare @ID_LISTE7 VARCHAR(max); 
declare @ID_LISTE8 VARCHAR(max); 
declare @ID_LISTE9 VARCHAR(max); 
declare @ID_LISTE10 VARCHAR(max);
declare @ID_ETUDE VARCHAR(max);
declare @EMAIL VARCHAR(max);
declare @NBENVOI VARCHAR(max); 
declare @LISTES VARCHAR(max); 
declare @NOMS_LISTES VARCHAR(max); 
declare @NUM_LISTES VARCHAR(max); 
declare @ENTETE_COLONNE1 VARCHAR(max);
declare @ENTETE_COLONNE2 VARCHAR(max);
declare @ENTETE_COLONNE2a VARCHAR(max);
declare @ENTETE_COLONNE3 VARCHAR(max);
declare @ENTETE_COLONNE4 VARCHAR(max);
declare @VIDE VARCHAR(max);
declare @VARIABLE_UTILISE VARCHAR(max);

declare @CONTACT_DISPO VARCHAR(max);
declare @MAIL_OUVERT_1 VARCHAR(max);  
declare @MAIL_OUVERT_2 VARCHAR(max);  
declare @MAIL_ENVOYE_1 VARCHAR(max);
declare @MAIL_ENVOYE_2 VARCHAR(max);
declare @Q_COMMENCE_1 VARCHAR(max);
declare @Q_COMMENCE_2 VARCHAR(max);
declare @Q_TERMINE_1 VARCHAR(max);
declare @Q_TERMINE_2 VARCHAR(max);
declare @Q_ERREUR VARCHAR(max);
declare @Q_ERREUR_1 VARCHAR(max);
declare @Q_ERREUR_2 VARCHAR(max);
declare @Q_HORS_CIBLE_1 VARCHAR(max);
declare @Q_HORS_CIBLE_2 VARCHAR(max);
declare @Q_ABANDON_1 VARCHAR(max);
declare @Q_ABANDON_2 VARCHAR(max);
declare @CONTACT_DISPO_PAR_MAIL VARCHAR(max);
declare @MAIL_OUVERT_1_PAR_MAIL VARCHAR(max);  
declare @MAIL_OUVERT_2_PAR_MAIL  VARCHAR(max);  
declare @MAIL_ENVOYE_1_PAR_MAIL  VARCHAR(max);
declare @MAIL_ENVOYE_2_PAR_MAIL  VARCHAR(max);
declare @Q_COMMENCE_1_PAR_MAIL  VARCHAR(max);
declare @Q_COMMENCE_2_PAR_MAIL  VARCHAR(max);
declare @Q_TERMINE_1_PAR_MAIL  VARCHAR(max);
declare @Q_TERMINE_2_PAR_MAIL  VARCHAR(max);
declare @Q_ERREUR_PAR_MAIL  VARCHAR(max);
declare @Q_ERREUR_1_PAR_MAIL  VARCHAR(max);
declare @Q_ERREUR_2_PAR_MAIL  VARCHAR(max);
declare @Q_HORS_CIBLE_1_PAR_MAIL  VARCHAR(max);
declare @Q_HORS_CIBLE_2_PAR_MAIL  VARCHAR(max);
declare @Q_ABANDON_2_PAR_MAIL  VARCHAR(max);
declare @Q_ABANDON_1_PAR_MAIL  VARCHAR(max);

declare @MAIL_OUVERT_1_PAR_DATE  VARCHAR(max);  
declare @MAIL_OUVERT_2_PAR_DATE   VARCHAR(max);  
declare @MAIL_ENVOYE_1_PAR_DATE   VARCHAR(max);
declare @MAIL_ENVOYE_2_PAR_DATE   VARCHAR(max);
declare @Q_COMMENCE_1_PAR_DATE   VARCHAR(max);
declare @Q_COMMENCE_2_PAR_DATE   VARCHAR(max);
declare @Q_TERMINE_1_PAR_DATE   VARCHAR(max);
declare @Q_TERMINE_2_PAR_DATE   VARCHAR(max);
declare @Q_ERREUR_PAR_DATE VARCHAR(max);
declare @Q_ERREUR_1_PAR_DATE   VARCHAR(max);
declare @Q_ERREUR_2_PAR_DATE   VARCHAR(max);
declare @Q_HORS_CIBLE_1_PAR_DATE  VARCHAR(max);
declare @Q_HORS_CIBLE_2_PAR_DATE  VARCHAR(max);
declare @Q_ABANDON_2_PAR_DATE   VARCHAR(max);
declare @Q_ABANDON_1_PAR_DATE  VARCHAR(max);
declare @VIEW1 VARCHAR(max);
declare @VIEW2 VARCHAR(max);
declare @DETAIL_MAILING VARCHAR(max);
declare @NOMETUDE VARCHAR(max);
declare @ETUDE VARCHAR(max);
declare @PAR_LISTE VARCHAR(max); 
declare @PAR_LISTE_NOM VARCHAR(max); 
declare @BOITE_MAIL VARCHAR(max); 
declare @BOITE_MAIL_NOM VARCHAR(max); 
declare @ENTETE_COLONNE_MAIL VARCHAR(max); 
declare @ENTETE_COLONNE_DATE VARCHAR(max); 
declare @CONTACT_DISPO_PAR_DATE VARCHAR(max); 
declare @DATE VARCHAR(max); 
declare @DATE_NOM VARCHAR(max); 

/*A METTRE A JOUR ICI*/

/*(A MODIFIER) 1- 
- NOM DE L'ETUDE POUR LE SUIVI
- NOM DU CHAMP 'EMAIL' DANS LES LISTES
- LES IDS DES DIFFERENTES LISTES EN SUPERVISION - ADAPTER EN FONCTION DU NB DE LISTES EXISTANTES !
*/
Set @NOMETUDE='BFA0182_SG_NveauxSouscrip_Baro2025'
Set @PAR_LISTE='[12378],[12379],[12380],[12381],[12383]'
Set @PAR_LISTE_NOM='''BFA0182_SG_NveauxSouscrip_Baro_Assurance Accidents'',''BFA0182_SG_NveauxSouscrip_Baro_Auto'',''BFA0182_SG_NveauxSouscrip_Baro_Habitation'',''BFA0182_SG_NveauxSouscrip_Baro_ProtectionJuridique'',''BFA0182_SG_NveauxSouscrip_Complémentaire Santé'''
Set @BOITE_MAIL='[gmail.com],[orange.fr],[hotmail.fr],[yahoo.fr],[hotmail.com],[wanadoo.fr],[laposte.net],[sfr.fr],[outlook.fr],[icloud.com],[free.fr],[live.fr],[yahoo.com],[neuf.fr],[outlook.com],[aol.com]'
Set @BOITE_MAIL_NOM='''[gmail.com]'',''[orange.fr]'',''[hotmail.fr]'',''[yahoo.fr]'',''[hotmail.com]'',''[wanadoo.fr]'',''[laposte.net]'',''[sfr.fr]'',''[outlook.fr]'',''[icloud.com]'',''[free.fr]'',''[live.fr]'',''[yahoo.com]'',''[neuf.fr]'',''[outlook.com]'',''[aol.com]'''
Set @EMAIL='CAST(adresse_email AS NVARCHAR(MAX))'
Set @DATE='[2025-05-23],[2025-05-24],[2025-05-25],[2025-05-26],[2025-05-27],[2025-05-28],[2025-05-29],[2025-05-30],[2025-05-31],[2025-06-1],[2025-06-2],[2025-06-3],[2025-06-4],[2025-06-5],[2025-06-6],[2025-06-7],[2025-06-8],[2025-06-9],[2025-06-10],[2025-06-11],[2025-06-12],[2025-06-13],[2025-06-14],[2025-06-15],[2025-06-16],[2025-06-17],[2025-06-18],[2025-06-19],[2025-06-20],[2025-06-21],[2025-06-22]'
Set @DATE_NOM='''[2025-05-23]'',''[2025-05-24]'',''[2025-05-25]'',''[2025-05-26]'',''[2025-05-27]'',''[2025-05-28]'',''[2025-05-29]'',''[2025-05-30]'',''[2025-05-31]'',''[2025-06-1]'',''[2025-06-2]'',''[2025-06-3]'',''[2025-06-4]'',''[2025-06-5]'',''[2025-06-6]'',''[2025-06-7]'',''[2025-06-8]'',''[2025-06-9]'',''[2025-06-10]'',''[2025-06-11]'',''[2025-06-12]'',''[2025-06-13]'',''[2025-06-14]'',''[2025-06-15]'',''[2025-06-16]'',''[2025-06-17]'',''[2025-06-18]'',''[2025-06-19]'',''[2025-06-20]'',''[2025-06-21]'',''[2025-06-22]'''
Set @ID_LISTE1='12378'
Set @ID_LISTE2='12379'
Set @ID_LISTE3='12380'
Set @ID_LISTE4='12381'
Set @ID_LISTE5='12383'






/*(A MODIFIER) 2- 
SUPPRIMER LES "UNIONS SELECT ..." CORRESPONDANT A DES LISTES QUI N'EXISTENT PAS : SI UNE SEULE LISTE -> LE SELECT DU DEBUT EST SEUL DANS LES 2 REQUETES
[AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority]
*/
Set @VIEW1='CREATE VIEW [CONTACT] As SELECT 
[AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE1 + ' as listId, ' + @EMAIL + ' as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE1 + '] 
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE2 + ' as listId, ' + @EMAIL + ' as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE2 + '] 
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE3 + ' as listId, ' + @EMAIL + ' as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE3 + '] 
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE4 + ' as listId, ' + @EMAIL + ' as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE4 + '] 
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE5 + ' as listId, ' + @EMAIL + ' as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE5 + '] 





'

Set @VIEW2='CREATE VIEW [LISTE_UTILISEES] As SELECT *, ' + @ID_LISTE1 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE1 + '] 
UNION SELECT *, ' + @ID_LISTE2 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE2 + '] 
UNION SELECT *, ' + @ID_LISTE3 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE3 + '] 
UNION SELECT *, ' + @ID_LISTE4 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE4 + '] 
UNION SELECT *, ' + @ID_LISTE5 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE5 + '] 





'

/*(A MODIFIER) - 3 
- L'ID DE L'ETUDE NNNN 
- LES DATES D'ENVOI SI UTILISEES : [Date1],[Date2]
LES ID DE LISTE EN ENLEVANT LES IDS QUI NE SERVENT PAS
- LES NOMS DES LISTES (ADAPTER LE NOMBRE'
*/
Set @ID_ETUDE ='4639'
Set @NBENVOI =''
Set @LISTES ='[' + @ID_LISTE1 + ']
,[' + @ID_LISTE2 + ']
,[' + @ID_LISTE3 + ']
,[' + @ID_LISTE4 + ']
,[' + @ID_LISTE5 + ']





'
Set @NUM_LISTES ='''' + @ID_LISTE1 + '''
,''' + @ID_LISTE2 + '''
,''' + @ID_LISTE3 + '''
,''' + @ID_LISTE4 + '''
,''' + @ID_LISTE5 + '''





'
Set @NOMS_LISTES ='''BFA0182_SG_NveauxSouscrip_Baro_Assurance Accidents''
,''BFA0182_SG_NveauxSouscrip_Baro_Auto''
,''BFA0182_SG_NveauxSouscrip_Baro_Habitation''
,''BFA0182_SG_NveauxSouscrip_Baro_ProtectionJuridique''
,''BFA0182_SG_NveauxSouscrip_Complémentaire Santé''





'

EXEC (@VIEW1)
EXEC (@VIEW2)


/*CREATION DES REQUETES*/

SET @CONTACT_DISPO='
SET NOCOUNT ON
SELECT ''CONTACTS DISPO'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [CONTACT]) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @MAIL_ENVOYE_1='
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - MAIL 1'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType=0) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @MAIL_OUVERT_1='
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - MAIL 1'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @Q_COMMENCE_1='
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @Q_TERMINE_1='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @Q_HORS_CIBLE_1='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @Q_ERREUR_1='
SET NOCOUNT ON;
SELECT ''ECHEC_ENVOI - MAIL 1'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @MAIL_ENVOYE_2='
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - RELANCES'','+ @PAR_LISTE +'
FROM
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType>0) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @MAIL_OUVERT_2='
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - RELANCES'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @Q_COMMENCE_2='
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @Q_TERMINE_2='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - RELANCES'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @Q_HORS_CIBLE_2='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @Q_ERREUR_2='
SET NOCOUNT ON;
SELECT ''ECHEC_ENVOI - RELANCES'','+ @PAR_LISTE +'
FROM   
(SELECT ListId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @PAR_LISTE+')) AS Tab2'

Set @MAIL_ENVOYE_1_PAR_DATE='
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - MAIL 1 (par date)'','+ @DATE +'
FROM   
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState=0 AND AskType=0) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @MAIL_OUVERT_1_PAR_DATE='
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - MAIL 1 (par date)'','+ @DATE +'
FROM   
(SELECT (CAST(LastReadTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @Q_COMMENCE_1_PAR_DATE='
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1 (par date) '','+ @DATE +'
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastResponseTimeUTC IS NOT NULL AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @Q_TERMINE_1_PAR_DATE='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1 (par date)'','+ @DATE +'
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @Q_HORS_CIBLE_1_PAR_DATE='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1 (par date)'','+ @DATE +'
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @Q_ERREUR_1_PAR_DATE='
SET NOCOUNT ON;
SELECT ''ECHEC_ENVOI - MAIL 1 (par date) '','+ @DATE +'
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @MAIL_ENVOYE_2_PAR_DATE='
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - RELANCES (par date) '','+ @DATE +'
FROM
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType>0) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @MAIL_OUVERT_2_PAR_DATE='
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - RELANCES (par date) '','+ @DATE +'
FROM   
(SELECT (CAST(LastReadTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @Q_COMMENCE_2_PAR_DATE='
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES (par date) '','+ @DATE +'
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @Q_TERMINE_2_PAR_DATE='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - RELANCES (par date) '','+ @DATE +'
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @Q_HORS_CIBLE_2_PAR_DATE='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES (par date) '','+ @DATE +'
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

Set @Q_ERREUR_2_PAR_DATE='
SET NOCOUNT ON;
SELECT ''ECHEC_ENVOI - RELANCES (par date) '','+ @DATE +'
FROM   
(SELECT (CAST(LastResponseTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'

SET @CONTACT_DISPO_PAR_MAIL='
SET NOCOUNT ON
SELECT ''CONTACTS DISPO (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN EMAIL like ''%gmail.com%'' then ''gmail.com''WHEN EMAIL like ''%orange.fr%'' then ''orange.fr''WHEN EMAIL like ''%hotmail.fr%'' then ''hotmail.fr''WHEN EMAIL like ''%yahoo.fr%'' then ''yahoo.fr''WHEN EMAIL like ''%hotmail.com%'' then ''hotmail.com''WHEN EMAIL like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN EMAIL like ''%laposte.net%'' then ''laposte.net''WHEN EMAIL like ''%sfr.fr%'' then ''sfr.fr''WHEN EMAIL like ''%outlook.fr%'' then ''outlook.fr''WHEN EMAIL like ''%icloud.com%'' then ''icloud.com''WHEN EMAIL like ''%free.fr%'' then ''free.fr''WHEN EMAIL like ''%live.fr%'' then ''live.fr''WHEN EMAIL like ''%yahoo.com%'' then ''yahoo.com''WHEN EMAIL like ''%neuf.fr%'' then ''neuf.fr''WHEN EMAIL like ''%outlook.com%'' then ''outlook.com''WHEN EMAIL like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [CONTACT]) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @MAIL_ENVOYE_1_PAR_MAIL='
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - MAIL 1 (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType=0) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @MAIL_OUVERT_1_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - MAIL 1 (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @Q_COMMENCE_1_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1 (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @Q_TERMINE_1_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1 (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @Q_HORS_CIBLE_1_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1 (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @Q_ERREUR_1_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''ECHEC_ENVOI - MAIL 1 (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType=0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @MAIL_ENVOYE_2_PAR_MAIL='
SET NOCOUNT ON
SELECT ''NB MAILS ENVOYES - RELANCES (detail par boite mail)'','+ @BOITE_MAIL +'
FROM
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType>0) As tab1
PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @MAIL_OUVERT_2_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''NB MAILS OUVERTS - RELANCES (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @Q_COMMENCE_2_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @Q_TERMINE_2_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE TERMINES - RELANCES (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @Q_HORS_CIBLE_2_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @Q_ERREUR_2_PAR_MAIL='
SET NOCOUNT ON;
SELECT ''ECHEC_ENVOI - RELANCES (detail par boite mail)'','+ @BOITE_MAIL +'
FROM   
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType>0) As tab1

PIVOT  
(Count (AskInterview)
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'

Set @DETAIL_MAILING='
SET NOCOUNT ON
SELECT [Type] ''N° email'', (CAST([Time] as DATE)), [ListId] ''Liste'', [Sender] ''Expediteur'',[Subject] ''Sujet'',count (MailId) As ''Nb mail envoyés''
  FROM [Askia_Statistics].[dbo].[Statistic_Mail] 
  WHERE Surveyid='+@ID_ETUDE+ ' And [Type]>=0  
  GROUP BY Type,(CAST([Time] as DATE)),ListId,Sender,Subject
  ORDER BY (CAST([Time] as DATE))'


/*MISE EN FORME*/

  Set @ETUDE='SET NOCOUNT ON; SELECT ''' + @NOMETUDE +''''
  Set @ENTETE_COLONNE1='SET NOCOUNT ON; SELECT ''DATE ENVOI'',''NB MAIL ENVOYES'',''N° EMAIL'''

Set @ENTETE_COLONNE2='SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @PAR_LISTE_NOM
  Set @ENTETE_COLONNE3='SET NOCOUNT ON; SELECT ''INFOS COMPLEMENTAIRE'''
  Set @ENTETE_COLONNE4='SET NOCOUNT ON; SELECT ''N° EMAIL'',''DATE'',''LISTE'',''EXPEDITEUR'',''OBJET'',''NB EMAILS ENVOYES'' '
  Set @VIDE='SET NOCOUNT ON; SELECT '' '''
Set @ENTETE_COLONNE_MAIL='SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @BOITE_MAIL_NOM
Set @ENTETE_COLONNE_DATE='SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @DATE_NOM

/*EXECUTION*/
 
EXEC (@ETUDE)
/*EXEC (@VIDE)
EXEC (@ENTETE_COLONNE1)
EXEC (@MAIL_ENVOYE)*/
EXEC (@VIDE)
EXEC (@ENTETE_COLONNE2a)
EXEC (@ENTETE_COLONNE2)
EXEC (@CONTACT_DISPO)
EXEC (@MAIL_ENVOYE_1)
EXEC (@MAIL_OUVERT_1) 
EXEC (@Q_COMMENCE_1)
EXEC (@Q_TERMINE_1)
EXEC (@Q_HORS_CIBLE_1)
EXEC (@Q_ABANDON_1)
EXEC (@Q_ERREUR_1)
EXEC (@MAIL_ENVOYE_2)
EXEC (@MAIL_OUVERT_2) 
EXEC (@Q_COMMENCE_2)
EXEC (@Q_TERMINE_2)
EXEC (@Q_HORS_CIBLE_2)
EXEC (@Q_ABANDON_2)
EXEC (@Q_ERREUR_2)
EXEC (@VIDE)
EXEC (@ENTETE_COLONNE_MAIL)
EXEC (@CONTACT_DISPO_PAR_MAIL)
EXEC (@MAIL_ENVOYE_1_PAR_MAIL)
EXEC (@MAIL_OUVERT_1_PAR_MAIL)
EXEC (@Q_COMMENCE_1_PAR_MAIL)
EXEC (@Q_TERMINE_1_PAR_MAIL)
EXEC (@Q_HORS_CIBLE_1_PAR_MAIL)
EXEC (@Q_ABANDON_1_PAR_MAIL)
EXEC (@Q_ERREUR_1_PAR_MAIL)
EXEC (@MAIL_ENVOYE_2_PAR_MAIL)
EXEC (@MAIL_OUVERT_2_PAR_MAIL)
EXEC (@Q_COMMENCE_2_PAR_MAIL)
EXEC (@Q_TERMINE_2_PAR_MAIL)
EXEC (@Q_HORS_CIBLE_2_PAR_MAIL)
EXEC (@Q_ABANDON_2_PAR_MAIL)
EXEC (@Q_ERREUR_2_PAR_MAIL)
EXEC (@VIDE)
EXEC (@ENTETE_COLONNE_DATE)
EXEC (@MAIL_ENVOYE_1_PAR_DATE)
EXEC (@MAIL_OUVERT_1_PAR_DATE)
EXEC (@Q_COMMENCE_1_PAR_DATE)
EXEC (@Q_TERMINE_1_PAR_DATE)
EXEC (@Q_HORS_CIBLE_1_PAR_DATE)
EXEC (@Q_ABANDON_1_PAR_DATE)
EXEC (@Q_ERREUR_1_PAR_DATE)
EXEC (@MAIL_ENVOYE_2_PAR_DATE)
EXEC (@MAIL_OUVERT_2_PAR_DATE)
EXEC (@Q_COMMENCE_2_PAR_DATE)
EXEC (@Q_TERMINE_2_PAR_DATE)
EXEC (@Q_HORS_CIBLE_2_PAR_DATE)
EXEC (@Q_ABANDON_2_PAR_DATE)
EXEC (@Q_ERREUR_2_PAR_DATE)
EXEC (@VIDE)
EXEC (@ENTETE_COLONNE3)
EXEC (@ENTETE_COLONNE4)
EXEC (@DETAIL_MAILING)
