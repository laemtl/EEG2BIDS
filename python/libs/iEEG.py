import os
import mne
from python.libs import EDF
from python.libs import TSV
from mne_bids import write_raw_bids, BIDSPath


# TarFile - tarfile the BIDS data.
class TarFile:
    # data = { bids_directory: '../path/to/bids/output', output_time: 'bids output time' }
    def __init__(self, data):
        import tarfile
        import os.path
        sep = os.path.sep
        source_dir = data['bids_directory'] + sep + data['output_time']  # current directory
        output_filename = data['bids_directory'] + sep + data['output_time'] + '.tar.gz'
        with tarfile.open(output_filename, "w:gz") as tar:
            tar.add(source_dir, arcname=os.path.basename(source_dir))
        import platform
        import subprocess
        if platform.system() == 'Windows':
            os.startfile(data['bids_directory'])
        elif platform.system() == 'Darwin':
            subprocess.Popen(['open', data['bids_directory']])
        else:
            subprocess.Popen(['xdg-open', data['bids_directory']])


# Anonymize - scrubs edf header data.
class Anonymize:
    file_path = ''
    header = []

    # data = { file_path: 'path to iEEG file' }
    def __init__(self, data):
        self.file_path = data['file_path']

        # read EDF file from file_path,
        file_in = EDF.EDFReader(fname=self.file_path)

        # read header of EDF file.
        self.header = file_in.readHeader()
        file_in.close()

    def get_header(self):
        return self.header

    def set_header(self, key, value):
        self.header[0][key] = value

    def make_copy(self, new_file):
        header = self.get_header()
        file_in = EDF.EDFReader(fname=self.file_path)
        file_out = EDF.EDFWriter()
        file_out.open(new_file)
        file_out.writeHeader(header)
        meas_info = header[0]
        for i in range(meas_info['n_records']):
            data = file_in.readBlock(i)
            file_out.writeBlock(data)
        file_in.close()
        file_out.close()


# Converter - Creates the BIDS output by edf file.
class Converter:
    m_info = ''

    # data = { file_path: '', bids_directory: '', read_only: false,
    # events_tsv: '', line_freq: '', site_id: '', project_id: '',
    # sub_project_id: '', visit_label: '', subject_id: ''}
    def __init__(self, data):
        print('- Converter: init started.')
        modality = 'seeg'
        if data['modality'] == 'EEG':
            modality = 'eeg'

        self.to_bids(
            file=data['file_path'],
            ch_type=modality,
            bids_directory=data['bids_directory'],
            subject_id=data['subject_id'],
            visit_label=data['visit_label'],
            output_time=data['output_time'],
            read_only=data['read_only'],
            line_freq=data['line_freq']
        )

    @staticmethod
    def validate(path):
        if os.path.isfile(path):
            return True
        else:
            print('File not found or is not file: %s', path)
            return False

    @classmethod
    def set_m_info(cls, value):
        cls.m_info = value

    def to_bids(self,
                file,
                bids_directory,
                subject_id,
                visit_label,
                output_time,
                task='test',
                ch_type='seeg',
                read_only=False,
                line_freq=60):
        if self.validate(file):
            reader = EDF.EDFReader(fname=file)
            m_info, c_info = reader.open(fname=file)
            self.set_m_info(m_info)

            raw = mne.io.read_raw_edf(input_fname=file)

            if read_only:
                return True

            raw.set_channel_types({ch: ch_type for ch in raw.ch_names})

            os.makedirs(bids_directory + os.path.sep + output_time, exist_ok=True)
            bids_directory = bids_directory + os.path.sep + output_time
            bids_root = bids_directory
            m_info['subject_id'] = subject_id  # 'alizee'
            subject = m_info['subject_id'].replace('_', '').replace('-', '').replace(' ', '')

            bids_basename = BIDSPath(subject=subject, task=task, root=bids_root, acquisition="seeg")
            session = visit_label
            bids_basename.update(session=session)

            raw.info['line_freq'] = line_freq
            raw.info['subject_info'] = {
                # 'his_id': "test",
                # 'birthday': (1993, 1, 26),
                # 'sex': 1,
                # 'hand': 2,
            }
            raw._init_kwargs = {
                'input_fname': file,
                'eog': None,
                'misc': None,
                'stim_channel': 'auto',
                'exclude': (),
                'preload': False,
                'verbose': None
            }
            try:
                write_raw_bids(raw, bids_basename, anonymize=dict(daysback=33630), overwrite=False, verbose=False)
            except Exception as ex:
                print(ex)
            print('finished')
        else:
            print('File not found or is not file: %s', file)


# Time - used for generating BIDS 'output' directory
class Time:
    def __init__(self):
        print('- Time: init started.')
        from datetime import datetime
        now = datetime.now()
        self.latest_output = now.strftime("%Y-%m-%d-%Hh%Mm%Ss")


# Modifier - 1) used for SiteID to participants.tsv
#            2) used for user's events.tsv to BIDS output events.tsv
class Modifier:
    def __init__(self, data, sio):
        print('- Modifier: init started.')
        TSV.Writer(data, sio)  # includes SiteID to participants.tsv
        TSV.Copy(data, sio)  # copies events.tsv to ieeg directory.
