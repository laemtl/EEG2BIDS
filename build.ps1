.\Scripts\activate
pyinstaller --paths=python python/eeg2bids.py -F `
--name eeg2bids-service-windows `
--add-data 'python/libs/bids_validator/rules/top_level_rules.json;./bids_validator/rules' `
--add-data 'python/libs/bids_validator/rules/associated_data_rules.json;./bids_validator/rules' `
--add-data 'python/libs/bids_validator/rules/file_level_rules.json;./bids_validator/rules' `
--add-data 'python/libs/bids_validator/rules/phenotypic_rules.json;./bids_validator/rules' `
--add-data 'python/libs/bids_validator/rules/session_level_rules.json;./bids_validator/rules' `
--add-data 'python/libs/bids_validator/rules/subject_level_rules.json;./bids_validator/rules' `
--add-data 'python/libs/bids_validator/tsv/non_custom_columns.json;./bids_validator/tsv' `
--hidden-import=eventlet.hubs.epolls `
--hidden-import=eventlet.hubs.kqueue `
--hidden-import=eventlet.hubs.selects `
--hidden-import=dns --hidden-import=dns.dnssec --hidden-import=dns.e164 `
--hidden-import=dns.hash --hidden-import=dns.namedict `
--hidden-import=dns.tsigkeyring --hidden-import=dns.update `
--hidden-import=dns.version  --hidden-import=dns.zone `
--hidden-import=engineio.async_drivers.eventlet `
--clean
