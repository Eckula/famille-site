/*SI BESOIN DE SUPPRIMER LES VUES

*/

DROP VIEW [LISTE_UTILISEES]
DROP VIEW [CONTACT]

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
declare @ID_LISTE11 VARCHAR(max);
declare @ID_LISTE12 VARCHAR(max);
declare @ID_LISTE13 VARCHAR(max);
declare @ID_LISTE14 VARCHAR(max);
declare @ID_LISTE15 VARCHAR(max);
declare @ID_LISTE16 VARCHAR(max);
declare @ID_LISTE17 VARCHAR(max);
declare @ID_LISTE18 VARCHAR(max);
declare @ID_LISTE19 VARCHAR(max);
declare @ID_LISTE20 VARCHAR(max);
declare @ID_LISTE21 VARCHAR(max);
declare @ID_LISTE22 VARCHAR(max);
declare @ID_LISTE23 VARCHAR(max);
declare @ID_LISTE24 VARCHAR(max);
declare @ID_LISTE25 VARCHAR(max);
declare @ID_LISTE26 VARCHAR(max);
declare @ID_LISTE27 VARCHAR(max);
declare @ID_LISTE28 VARCHAR(max);
declare @ID_LISTE29 VARCHAR(max);
declare @ID_LISTE30 VARCHAR(max);
declare @ID_LISTE31 VARCHAR(max);
declare @ID_LISTE32 VARCHAR(max);
declare @ID_LISTE33 VARCHAR(max);
declare @ID_LISTE34 VARCHAR(max);
declare @ID_LISTE35 VARCHAR(max);
declare @ID_LISTE36 VARCHAR(max);
declare @ID_LISTE37 VARCHAR(max);
declare @ID_LISTE38 VARCHAR(max);
declare @ID_LISTE39 VARCHAR(max);
declare @ID_LISTE40 VARCHAR(max);
declare @ID_LISTE41 VARCHAR(max);
declare @ID_LISTE42 VARCHAR(max);
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
declare @CONTACT_DISPO_PAR_LISTE VARCHAR(max);
declare @MAIL_OUVERT_1_PAR_LISTE VARCHAR(max);  
declare @MAIL_OUVERT_2_PAR_LISTE  VARCHAR(max);  
declare @MAIL_ENVOYE_1_PAR_LISTE  VARCHAR(max);
declare @MAIL_ENVOYE_2_PAR_LISTE  VARCHAR(max);
declare @Q_COMMENCE_1_PAR_LISTE  VARCHAR(max);
declare @Q_COMMENCE_2_PAR_LISTE  VARCHAR(max);
declare @Q_TERMINE_1_PAR_LISTE  VARCHAR(max);
declare @Q_TERMINE_2_PAR_LISTE  VARCHAR(max);
declare @Q_ERREUR_PAR_LISTE  VARCHAR(max);
declare @Q_ERREUR_1_PAR_LISTE  VARCHAR(max);
declare @Q_ERREUR_2_PAR_LISTE  VARCHAR(max);
declare @Q_HORS_CIBLE_1_PAR_LISTE  VARCHAR(max);
declare @Q_HORS_CIBLE_2_PAR_LISTE  VARCHAR(max);
declare @Q_ABANDON_2_PAR_LISTE  VARCHAR(max);
declare @Q_ABANDON_1_PAR_LISTE  VARCHAR(max);
declare @VIEW1 VARCHAR(max);
declare @VIEW2 VARCHAR(max);
declare @DETAIL_MAILING VARCHAR(max);
declare @NOMETUDE VARCHAR(max);
declare @ETUDE VARCHAR(max);
declare @DATE VARCHAR(max); 
declare @DATE_NOM VARCHAR(max); 
declare @BOITE_MAIL VARCHAR(max); 
declare @BOITE_MAIL_NOM VARCHAR(max); 
declare @ENTETE_COLONNE_MAIL VARCHAR(max); 
declare @ENTETE_COLONNE_LISTE1 VARCHAR(max); 
declare @ENTETE_COLONNE_LISTE2 VARCHAR(max); 
/*A METTRE A JOUR ICI*/

/*(A MODIFIER) 1- 
- NOM DE L'ETUDE POUR LE SUIVI
- NOM DU CHAMP 'EMAIL' DANS LES LISTES
- LES IDS DES DIFFERENTES LISTES EN SUPERVISION - ADAPTER EN FONCTION DU NB DE LISTES EXISTANTES !
*/
Set @NOMETUDE='ENE0081_ENGIE_PostTestMagazine_n4'
Set @DATE='[2024-07-15],[2024-07-16],[2024-07-17],[2024-07-18],[2024-07-19],[2024-07-20],[2024-07-21],[2024-07-22],[2024-07-23],[2024-07-24],[2024-07-25],[2024-07-26],[2024-07-27],[2024-07-28],[2024-07-29],[2024-07-30],[2024-07-31],[2024-08-01],[2024-08-02],[2024-08-03],[2024-08-04],[2024-08-05]'
Set @DATE_NOM='''[2024-07-15]'',''[2024-07-16]'',''[2024-07-17]'',''[2024-07-18]'',''[2024-07-19]'',''[2024-07-20]'',''[2024-07-21]'',''[2024-07-22]'',''[2024-07-23]'',''[2024-07-24]'',''[2024-07-25]'',''[2024-07-26]'',''[2024-07-27]'',''[2024-07-28]'',''[2024-07-29]'',''[2024-07-30]'',''[2024-07-31]'',''[2024-08-01]'',''[2024-08-02]'',''[2024-08-03]'',''[2024-08-04]'',''[2024-08-05]'''
Set @BOITE_MAIL='[gmail.com],[orange.fr],[hotmail.fr],[yahoo.fr],[hotmail.com],[wanadoo.fr],[laposte.net],[sfr.fr],[outlook.fr],[icloud.com],[free.fr],[live.fr],[yahoo.com],[neuf.fr],[outlook.com],[aol.com]'
Set @BOITE_MAIL_NOM='''[gmail.com]'',''[orange.fr]'',''[hotmail.fr]'',''[yahoo.fr]'',''[hotmail.com]'',''[wanadoo.fr]'',''[laposte.net]'',''[sfr.fr]'',''[outlook.fr]'',''[icloud.com]'',''[free.fr]'',''[live.fr]'',''[yahoo.com]'',''[neuf.fr]'',''[outlook.com]'',''[aol.com]'''
Set @EMAIL='Email_Address'
Set @ID_LISTE1='11629'
Set @ID_LISTE2='11630'
Set @ID_LISTE3='11631'
Set @ID_LISTE4='11632'
Set @ID_LISTE5='11633'
Set @ID_LISTE6='11634'
Set @ID_LISTE7='11635'
Set @ID_LISTE8='11636'
Set @ID_LISTE9='11637'
Set @ID_LISTE10='11638'
Set @ID_LISTE11='11639'
Set @ID_LISTE12='11640'
Set @ID_LISTE13='11641'
Set @ID_LISTE14='11642'
Set @ID_LISTE15='11643'
Set @ID_LISTE16='11644'
Set @ID_LISTE17='11645'
Set @ID_LISTE18='11646'
Set @ID_LISTE19='11647'
Set @ID_LISTE20='11648'
Set @ID_LISTE21='11649'
Set @ID_LISTE22='11650'
Set @ID_LISTE23='11651'
Set @ID_LISTE24='11652'
Set @ID_LISTE25='11653'
Set @ID_LISTE26='11654'
Set @ID_LISTE27='11655'
Set @ID_LISTE28='11656'
Set @ID_LISTE29='11657'
Set @ID_LISTE30='11658'
Set @ID_LISTE31='11659'
Set @ID_LISTE32='11660'
Set @ID_LISTE33='11661'
Set @ID_LISTE34='11662'
Set @ID_LISTE35='11663'
Set @ID_LISTE36='11664'
Set @ID_LISTE37='11665'
Set @ID_LISTE38='11666'
Set @ID_LISTE39='11667'
Set @ID_LISTE40='11668'
Set @ID_LISTE41='11669'
Set @ID_LISTE42='11670'

/*(A MODIFIER) 2- 						
SUPPRIMER LES "UNIONS SELECT ..." CORRESPONDANT A DES LISTES QUI N'EXISTENT PAS : SI UNE SEULE LISTE -> LE SELECT DU DEBUT EST SEUL DANS LES 2 REQUETES						
[AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority]						
*/						
Set @VIEW1='CREATE VIEW [CONTACT] As SELECT 						
[AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE1 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE1 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE2 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE2 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE3 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE3 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE4 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE4 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE5 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE5 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE6 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE6 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE7 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE7 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE8 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE8 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE9 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE9 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE10 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE10 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE11 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE11 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE12 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE12 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE13 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE13 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE14 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE14 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE15 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE15 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE16 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE16 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE17 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE17 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE18 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE18 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE19 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE19 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE20 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE20 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE21 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE21 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE22 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE22 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE23 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE23 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE24 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE24 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE25 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE25 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE26 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE26 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE27 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE27 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE28 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE28 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE29 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE29 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE30 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE30 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE31 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE31 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE32 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE32 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE33 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE33 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE34 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE34 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE35 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE35 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE36 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE36 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE37 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE37 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE38 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE38 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE39 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE39 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE40 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE40 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE41 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE41 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
UNION SELECT [AskInterview],[AskSurveyId],[AskSurveyPosition],[AskSurveyInterviewId],[AskSurveyInterviewState],[AskTaskInterviewGuid],[AskPriority],[AskDoNotMailListId],[AskInterviewFiltered],[AskTimeZoneId],[AskMode],[AskLastWebResponseUTC],[AskLastWebResponseUTCOffsetRespondent],[AskLastWebResult],[AskWebWorkingPriority], ' + @ID_LISTE42 + ' as listId, [' + @EMAIL + '] as EMAIL FROM [Askia_Lists].[dbo].[AskList' + @ID_LISTE42 + '] WHERE [AUTRES_TYPE_ENERGIE] like ''%CIBLE%'' AND [Email_Address] IS NOT NULL
'						

Set @VIEW2='CREATE VIEW [LISTE_UTILISEES] As SELECT *, ' + @ID_LISTE1 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE1 + '] 	
UNION SELECT *, ' + @ID_LISTE2 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE2 + '] 
UNION SELECT *, ' + @ID_LISTE3 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE3 + '] 
UNION SELECT *, ' + @ID_LISTE4 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE4 + '] 
UNION SELECT *, ' + @ID_LISTE5 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE5 + '] 
UNION SELECT *, ' + @ID_LISTE6 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE6 + '] 
UNION SELECT *, ' + @ID_LISTE7 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE7 + '] 
UNION SELECT *, ' + @ID_LISTE8 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE8 + '] 
UNION SELECT *, ' + @ID_LISTE9 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE9 + ']
UNION SELECT *, ' + @ID_LISTE10 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE10 + '] 
UNION SELECT *, ' + @ID_LISTE11 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE11 + '] 
UNION SELECT *, ' + @ID_LISTE12 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE12 + '] 
UNION SELECT *, ' + @ID_LISTE13 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE13 + '] 
UNION SELECT *, ' + @ID_LISTE14 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE14 + '] 
UNION SELECT *, ' + @ID_LISTE15 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE15 + '] 
UNION SELECT *, ' + @ID_LISTE16 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE16 + '] 
UNION SELECT *, ' + @ID_LISTE17 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE17 + '] 
UNION SELECT *, ' + @ID_LISTE18 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE18 + '] 
UNION SELECT *, ' + @ID_LISTE19 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE19 + '] 
UNION SELECT *, ' + @ID_LISTE20 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE20 + '] 
UNION SELECT *, ' + @ID_LISTE21 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE21 + '] 
UNION SELECT *, ' + @ID_LISTE22 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE22 + '] 
UNION SELECT *, ' + @ID_LISTE23 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE23 + '] 
UNION SELECT *, ' + @ID_LISTE24 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE24 + ']
UNION SELECT *, ' + @ID_LISTE25 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE25 + '] 
UNION SELECT *, ' + @ID_LISTE26 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE26 + '] 
UNION SELECT *, ' + @ID_LISTE27 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE27 + '] 
UNION SELECT *, ' + @ID_LISTE28 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE28 + '] 
UNION SELECT *, ' + @ID_LISTE29 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE29 + '] 
UNION SELECT *, ' + @ID_LISTE30 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE30 + '] 
UNION SELECT *, ' + @ID_LISTE31 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE31 + '] 
UNION SELECT *, ' + @ID_LISTE32 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE32 + '] 
UNION SELECT *, ' + @ID_LISTE33 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE33 + '] 
UNION SELECT *, ' + @ID_LISTE34 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE34 + '] 
UNION SELECT *, ' + @ID_LISTE35 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE35 + '] 
UNION SELECT *, ' + @ID_LISTE36 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE36 + '] 
UNION SELECT *, ' + @ID_LISTE37 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE37 + '] 
UNION SELECT *, ' + @ID_LISTE38 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE38 + '] 
UNION SELECT *, ' + @ID_LISTE39 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE39 + '] 
UNION SELECT *, ' + @ID_LISTE40 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE40 + '] 
UNION SELECT *, ' + @ID_LISTE41 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE41 + '] 
UNION SELECT *, ' + @ID_LISTE42 + ' as listId FROM [Askia_Lists].[dbo].[AskEmail' + @ID_LISTE42 + '] 							
'						
						
/*(A MODIFIER) - 3 						
- L'ID DE L'ETUDE NNNN 						
- LES DATES D'ENVOI SI UTILISEES : [Date1],[Date2]						
LES ID DE LISTE EN ENLEVANT LES IDS QUI NE SERVENT PAS						
- LES NOMS DES LISTES (ADAPTER LE NOMBRE'						
*/						
Set @ID_ETUDE ='4293'						
Set @NBENVOI =''						
Set @LISTES ='[' + @ID_LISTE1 + ']	
,[' + @ID_LISTE2 + ']
,[' + @ID_LISTE3 + ']
,[' + @ID_LISTE4 + ']
,[' + @ID_LISTE5 + ']
,[' + @ID_LISTE6 + ']
,[' + @ID_LISTE7 + ']
,[' + @ID_LISTE8 + ']
,[' + @ID_LISTE9 + ']
,[' + @ID_LISTE10 + ']
,[' + @ID_LISTE11 + ']
,[' + @ID_LISTE12 + ']
,[' + @ID_LISTE13 + ']
,[' + @ID_LISTE14 + ']
,[' + @ID_LISTE15 + ']
,[' + @ID_LISTE16 + ']
,[' + @ID_LISTE17 + ']
,[' + @ID_LISTE18 + ']
,[' + @ID_LISTE19 + ']
,[' + @ID_LISTE20 + ']
,[' + @ID_LISTE21 + ']
,[' + @ID_LISTE22 + ']
,[' + @ID_LISTE23 + ']
,[' + @ID_LISTE24 + ']
,[' + @ID_LISTE25 + ']
,[' + @ID_LISTE26 + ']
,[' + @ID_LISTE27 + ']
,[' + @ID_LISTE28 + ']
,[' + @ID_LISTE29 + ']
,[' + @ID_LISTE30 + ']
,[' + @ID_LISTE31 + ']
,[' + @ID_LISTE32 + ']
,[' + @ID_LISTE33 + ']
,[' + @ID_LISTE34 + ']
,[' + @ID_LISTE35 + ']
,[' + @ID_LISTE36 + ']
,[' + @ID_LISTE37 + ']
,[' + @ID_LISTE38 + ']
,[' + @ID_LISTE39 + ']
,[' + @ID_LISTE40 + ']
,[' + @ID_LISTE41 + ']
,[' + @ID_LISTE42 + ']
'						
Set @NUM_LISTES ='''' + @ID_LISTE1 + '''	
,''' + @ID_LISTE2 + '''
,''' + @ID_LISTE3 + '''
,''' + @ID_LISTE4 + '''
,''' + @ID_LISTE5 + '''
,''' + @ID_LISTE6 + '''
,''' + @ID_LISTE7 + '''
,''' + @ID_LISTE8 + '''
,''' + @ID_LISTE9 + '''
,''' + @ID_LISTE10 + '''
,''' + @ID_LISTE11 + '''
,''' + @ID_LISTE12 + '''
,''' + @ID_LISTE13 + '''
,''' + @ID_LISTE14 + '''
,''' + @ID_LISTE15 + '''
,''' + @ID_LISTE16 + '''
,''' + @ID_LISTE17 + '''
,''' + @ID_LISTE18 + '''
,''' + @ID_LISTE19 + '''
,''' + @ID_LISTE20 + '''
,''' + @ID_LISTE21 + '''
,''' + @ID_LISTE22 + '''
,''' + @ID_LISTE23 + '''
,''' + @ID_LISTE24 + '''
,''' + @ID_LISTE25 + '''
,''' + @ID_LISTE26 + '''
,''' + @ID_LISTE27 + '''
,''' + @ID_LISTE28 + '''
,''' + @ID_LISTE29 + '''
,''' + @ID_LISTE30 + '''
,''' + @ID_LISTE31 + '''
,''' + @ID_LISTE32 + '''
,''' + @ID_LISTE33 + '''
,''' + @ID_LISTE34 + '''
,''' + @ID_LISTE35 + '''
,''' + @ID_LISTE36 + '''
,''' + @ID_LISTE37 + '''
,''' + @ID_LISTE38 + '''
,''' + @ID_LISTE39 + '''
,''' + @ID_LISTE40 + '''
,''' + @ID_LISTE41 + '''
,''' + @ID_LISTE42 + '''
'						
Set @NOMS_LISTES ='''ENE0081_ENGIE_PostTestMagazine_LOT1 - Elec''	
,''ENE0081_ENGIE_PostTestMagazine_LOT1 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT1 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT2 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT2 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT2 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT3 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT3 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT3 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT4 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT4 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT4 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT5 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT5 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT5 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT6 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT6 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT6 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT7 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT7 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT7 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT8 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT8 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT8 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT9 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT9 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT9 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT10 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT10 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT10 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT11 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT11 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT11 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT12 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT12 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT12 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT13 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT13 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT13 - Dual''
,''ENE0081_ENGIE_PostTestMagazine_LOT14 - Elec''
,''ENE0081_ENGIE_PostTestMagazine_LOT14 - Gaz''
,''ENE0081_ENGIE_PostTestMagazine_LOT14 - Dual''
'						
						
EXEC (@VIEW1)						
EXEC (@VIEW2)						
						
						
/*CREATION DES REQUETES*/						
						
SET @CONTACT_DISPO='						
SET NOCOUNT ON						
SELECT ''CONTACTS DISPO'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskLastWebResponseUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [CONTACT]) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @MAIL_ENVOYE_1='						
SET NOCOUNT ON						
SELECT ''NB MAILS ENVOYES - MAIL 1'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType=0) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @MAIL_OUVERT_1='						
SET NOCOUNT ON;						
SELECT ''NB MAILS OUVERTS - MAIL 1'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @Q_COMMENCE_1='						
SET NOCOUNT ON;						
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @Q_TERMINE_1='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @Q_HORS_CIBLE_1='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @Q_ERREUR_1='						
SET NOCOUNT ON;						
SELECT ''ECHEC_ENVOI - MAIL 1'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @MAIL_ENVOYE_2='						
SET NOCOUNT ON						
SELECT ''NB MAILS ENVOYES - RELANCES'','+ @DATE +'						
FROM						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType>0) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @MAIL_OUVERT_2='						
SET NOCOUNT ON;						
SELECT ''NB MAILS OUVERTS - RELANCES'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @Q_COMMENCE_2='						
SET NOCOUNT ON;						
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @Q_TERMINE_2='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE TERMINES - RELANCES'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @Q_HORS_CIBLE_2='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
						
Set @Q_ERREUR_2='						
SET NOCOUNT ON;						
SELECT ''ECHEC_ENVOI - RELANCES'','+ @DATE +'						
FROM   						
(SELECT (CAST(AskTimeUTC AS DATE)) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType>0) As tab1						

PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @DATE+')) AS Tab2'						
		
		
SET @CONTACT_DISPO_PAR_MAIL='						
SET NOCOUNT ON						
SELECT ''CONTACTS DISPOS'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN EMAIL like ''%gmail.com%'' then ''gmail.com''WHEN EMAIL like ''%orange.fr%'' then ''orange.fr''WHEN EMAIL like ''%hotmail.fr%'' then ''hotmail.fr''WHEN EMAIL like ''%yahoo.fr%'' then ''yahoo.fr''WHEN EMAIL like ''%hotmail.com%'' then ''hotmail.com''WHEN EMAIL like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN EMAIL like ''%laposte.net%'' then ''laposte.net''WHEN EMAIL like ''%sfr.fr%'' then ''sfr.fr''WHEN EMAIL like ''%outlook.fr%'' then ''outlook.fr''WHEN EMAIL like ''%icloud.com%'' then ''icloud.com''WHEN EMAIL like ''%free.fr%'' then ''free.fr''WHEN EMAIL like ''%live.fr%'' then ''live.fr''WHEN EMAIL like ''%yahoo.com%'' then ''yahoo.com''WHEN EMAIL like ''%neuf.fr%'' then ''neuf.fr''WHEN EMAIL like ''%outlook.com%'' then ''outlook.com''WHEN EMAIL like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [CONTACT]) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @MAIL_ENVOYE_1_PAR_MAIL='						
SET NOCOUNT ON						
SELECT ''NB MAILS ENVOYES - MAIL 1'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType=0) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @MAIL_OUVERT_1_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''NB MAILS OUVERTS - MAIL 1'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @Q_COMMENCE_1_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @Q_TERMINE_1_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @Q_HORS_CIBLE_1_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @Q_ERREUR_1_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''ECHEC_ENVOI - MAIL 1'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @MAIL_ENVOYE_2_PAR_MAIL='						
SET NOCOUNT ON						
SELECT ''NB MAILS ENVOYES - RELANCES'','+ @BOITE_MAIL +'						
FROM						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType>0) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @MAIL_OUVERT_2_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''NB MAILS OUVERTS - RELANCES'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @Q_COMMENCE_2_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @Q_TERMINE_2_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE TERMINES - RELANCES'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @Q_HORS_CIBLE_2_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
Set @Q_ERREUR_2_PAR_MAIL='						
SET NOCOUNT ON;						
SELECT ''ECHEC_ENVOI - RELANCES'','+ @BOITE_MAIL +'						
FROM   						
(SELECT  (CASE WHEN AskEmail like ''%gmail.com%'' then ''gmail.com''WHEN AskEmail like ''%orange.fr%'' then ''orange.fr''WHEN AskEmail like ''%hotmail.fr%'' then ''hotmail.fr''WHEN AskEmail like ''%yahoo.fr%'' then ''yahoo.fr''WHEN AskEmail like ''%hotmail.com%'' then ''hotmail.com''WHEN AskEmail like ''%wanadoo.fr%'' then ''wanadoo.fr''WHEN AskEmail like ''%laposte.net%'' then ''laposte.net''WHEN AskEmail like ''%sfr.fr%'' then ''sfr.fr''WHEN AskEmail like ''%outlook.fr%'' then ''outlook.fr''WHEN AskEmail like ''%icloud.com%'' then ''icloud.com''WHEN AskEmail like ''%free.fr%'' then ''free.fr''WHEN AskEmail like ''%live.fr%'' then ''live.fr''WHEN AskEmail like ''%yahoo.com%'' then ''yahoo.com''WHEN AskEmail like ''%neuf.fr%'' then ''neuf.fr''WHEN AskEmail like ''%outlook.com%'' then ''outlook.com''WHEN AskEmail like ''%aol.com%'' then ''aol.com''else ''autre''end) AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType>0) As tab1						

PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @BOITE_MAIL+')) AS Tab2'						
						
						
SET @CONTACT_DISPO_PAR_LISTE='						
SET NOCOUNT ON						
SELECT ''CONTACTS DISPOS'','+ @LISTES +'						
FROM   						
(SELECT  listId AS V_SEGMENTATION, [AskInterview] FROM [CONTACT]) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @MAIL_ENVOYE_1_PAR_LISTE='						
SET NOCOUNT ON						
SELECT ''NB MAILS ENVOYES - MAIL 1'','+ @LISTES +'						
FROM   						
(SELECT  listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType=0) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @MAIL_OUVERT_1_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''NB MAILS OUVERTS - MAIL 1'','+ @LISTES +'						
FROM   						
(SELECT listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @Q_COMMENCE_1_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - MAIL 1'','+ @LISTES +'						
FROM   						
(SELECT  listId AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @Q_TERMINE_1_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE TERMINES - MAIL 1'','+ @LISTES +'						
FROM   						
(SELECT  listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @Q_HORS_CIBLE_1_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE HORS CIBLE - MAIL 1'','+ @LISTES +'						
FROM   						
(SELECT  listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @Q_ERREUR_1_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''ECHEC_ENVOI - MAIL 1'','+ @LISTES +'						
FROM   						
(SELECT listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType=0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @MAIL_ENVOYE_2_PAR_LISTE='						
SET NOCOUNT ON						
SELECT ''NB MAILS ENVOYES - RELANCES'','+ @LISTES +'						
FROM						
(SELECT listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where AskState=0 AND AskType>0) As tab1						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @MAIL_OUVERT_2_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''NB MAILS OUVERTS - RELANCES'','+ @LISTES +'						
FROM   						
(SELECT listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] where LastReadTimeUTC IS NOT NULL AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @Q_COMMENCE_2_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''NB CLICS / QUESTIONNAIRE COMMENCES - RELANCES'','+ @LISTES +'						
FROM   						
(SELECT listId AS V_SEGMENTATION , [AskInterview] FROM [LISTE_UTILISEES] Where LastResponseTimeUTC IS NOT NULL AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @Q_TERMINE_2_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE TERMINES - RELANCES'','+ @LISTES +'						
FROM   						
(SELECT listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=0 AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @Q_HORS_CIBLE_2_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''QUESTIONNAIRE HORS CIBLE - RELANCES'','+ @LISTES +'						
FROM   						
(SELECT listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where LastResult=1005 AND AskType>0) As tab1						
						
PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'						
						
Set @Q_ERREUR_2_PAR_LISTE='						
SET NOCOUNT ON;						
SELECT ''ECHEC_ENVOI - RELANCES'','+ @LISTES +'						
FROM   						
(SELECT listId AS V_SEGMENTATION, [AskInterview] FROM [LISTE_UTILISEES] Where AskState>0 AND AskType>0) As tab1						

PIVOT  						
(Count (AskInterview)						
FOR V_SEGMENTATION IN ('+ @LISTES+')) AS Tab2'		

						
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
Set @ENTETE_COLONNE2='SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @DATE_NOM						
Set @ENTETE_COLONNE3='SET NOCOUNT ON; SELECT ''INFOS COMPLEMENTAIRE'''						
Set @ENTETE_COLONNE4='SET NOCOUNT ON; SELECT ''N° EMAIL'',''DATE'',''LISTE'',''EXPEDITEUR'',''OBJET'',''NB EMAILS ENVOYES'' '						
Set @VIDE='SET NOCOUNT ON; SELECT '' '''						
Set @ENTETE_COLONNE_MAIL='SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @BOITE_MAIL_NOM		
Set @ENTETE_COLONNE_LISTE1='SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @NUM_LISTES			
Set @ENTETE_COLONNE_LISTE2='SET NOCOUNT ON; SELECT ''STATISTIQUE '', ' + @NOMS_LISTES		
						
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
EXEC (@ENTETE_COLONNE_LISTE1)	
EXEC (@ENTETE_COLONNE_LISTE2)						
EXEC (@CONTACT_DISPO_PAR_LISTE)						
EXEC (@MAIL_ENVOYE_1_PAR_LISTE)						
EXEC (@MAIL_OUVERT_1_PAR_LISTE)						
EXEC (@Q_COMMENCE_1_PAR_LISTE)						
EXEC (@Q_TERMINE_1_PAR_LISTE)						
EXEC (@Q_HORS_CIBLE_1_PAR_LISTE)						
EXEC (@Q_ABANDON_1_PAR_LISTE)						
EXEC (@Q_ERREUR_1_PAR_LISTE)						
EXEC (@MAIL_ENVOYE_2_PAR_LISTE)						
EXEC (@MAIL_OUVERT_2_PAR_LISTE)						
EXEC (@Q_COMMENCE_2_PAR_LISTE)						
EXEC (@Q_TERMINE_2_PAR_LISTE)						
EXEC (@Q_HORS_CIBLE_2_PAR_LISTE)						
EXEC (@Q_ABANDON_2_PAR_LISTE)						
EXEC (@Q_ERREUR_2_PAR_LISTE)						
EXEC (@VIDE)						
EXEC (@ENTETE_COLONNE3)						
EXEC (@ENTETE_COLONNE4)						
EXEC (@DETAIL_MAILING)						
