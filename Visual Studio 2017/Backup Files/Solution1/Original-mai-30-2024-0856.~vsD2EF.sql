/****** Script de la commande SelectTopNRows à partir de SSMS  ******/
SELECT TOP (1000) [ID]
      ,[ORIGINE]
      ,[TYPE]
      ,[SIREN]
      ,[ENLEVER SIREN]
      ,[No_client]
      ,[MAIL]
      ,[TEL]
      ,[ENT]
      ,[TYPO]
      ,[MEL]
      ,[ECONOMIE_SOCIALE]
      ,[STPNE]
      ,[STTEL]
      ,[STPEF]
      ,[STCAR]
      ,[STENT]
      ,[STVREL]
      ,[SERV]
      ,[NAME]
      ,[NAME2]
      ,[SIREN-corrigé]
      ,[No client]
      ,[Nom du client]
      ,[Apporteur]
      ,[Marché]
      ,[PRO OU ENT]
      ,[Nom prenom commercial]
      ,[Responsable]
      ,[E-Mail]
      ,[demande retrait bq et caisses]
      ,[optout skeepers]
      ,[pas de ctx]
      ,[DOUBLON MAIL]
      ,[Fax]
      ,[Mobile]
      ,[Téléphone]
      ,[No immatriculation]
      ,[Contrat]
      ,[Contrat assuré (Y/N)]
      ,[Sinistre déclaré (Y/N)]
      ,[Flag Type Sinistre]
      ,[Type contrat fermé / fleet]
      ,[Départ le]
      ,[Retour prévu le]
      ,[Energie vehicule]
      ,[Statut du contrat]
      ,[Assistance]
      ,[Pneumatiques]
      ,[Télépéage]
      ,[Perte financiere]
      ,[Typage Client]
      ,[Marque du vehicule]
      ,[Carburant]
      ,[Entretien]
      ,[Vehicule relais]
      ,[Date de mise à la route]
      ,[Date premiere#fact#du loyer]
      ,[V_nbr sinistres]
      ,[V_dossier_sinistre]
      ,[MEL1]
  FROM [ListesExternes].[dbo].[BFA0131_BPCE_Lease_LLD_2024]