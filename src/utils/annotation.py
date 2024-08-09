import numpy as np

import glob

import pandas as pd

from scipy.stats import kurtosis, skew

import datetime

from sklearn.preprocessing import minmax_scale

import time

import os.path

import src.utils.eda as eda

from biosppy import tools

import h5py

import scipy

from scipy.interpolate import interp1d



from scenedetect.video_manager import VideoManager

from scenedetect.scene_manager import SceneManager

# For caching detection metrics and saving/loading to a stats file

from scenedetect.stats_manager import StatsManager



# For content-aware scene detection:

from scenedetect.detectors.content_detector import ContentDetector

from scenedetect.detectors.threshold_detector import ThresholdDetector
import matplotlib.pylab as plt




def resampling(x, y, SR):

    ''' Signal resampling



    Input

    --------

    x : array

        Time vector

    y : array

        Input signal

    SR : float

        New sampling rate

    

    Output

    --------

    xnew : array

            Time resulting from interpolation

    ynew : array

            Resampled signal

    '''

    try:

        interpf = interp1d(x, y, kind='linear')  # resample

        xnew = np.arange(x[0], x[-1], 1/SR)  # all samples with same SR

        ynew = interpf(xnew)

    except Exception as e:

        print(e)

        xnew = x

        ynew = y



    return xnew, ynew





def clean_dataset(data):

    # d = {str(lab): data[:, idx] for idx, lab in enumerate(labels_name)}

    try:

        df = pd.DataFrame(data=data)

        df = df.replace([np.inf, -np.inf, np.nan], 0.0)

        df = df.values.ravel()

    except:

        df = []

    return df





def merge_events(signal, onsets, end, amp, EDR_inter_THR):

    onsets = np.array(onsets)

    end = np.array(end)

    on_to_remove, end_to_remove, amp_to_remove = [], [], []

    for i in range(len(end) - 1):

        if ((onsets[i+1] - onsets[i]) < EDR_inter_THR):  # remove onset + 1 + end
            if np.argmax([amp[i], amp[i+1]]) == 0:
                on_to_remove.append(i+1)
                end_to_remove.append(i+1)
                amp_to_remove.append(i+1)            
            else:
                on_to_remove.append(i)
                end_to_remove.append(i)
                amp_to_remove.append(i)            
                #amp[i] = amp[i] + amp[i+1]  

    onsets = np.delete(onsets, on_to_remove)
    end = np.delete(end, end_to_remove)
    end = list(np.array(end) - 1)
    amp = np.delete(amp, amp_to_remove)    

    return list(onsets), list(end), list(amp)





def getDeviceType(user_dir):

    # return 0: #FMCI , 1: #BITalino, 2: #EMPATICA; 3: hdf5

    if "hdf5" in user_dir: 

        return 3

    else:

        file_object = open(user_dir, "r")

        line = file_object.readline()

        if "OpenSignals" in user_dir or "OpenSignals" in line or "bit" in user_dir or "BIT" in user_dir or "Bit" in user_dir:

            return 1

        elif "FMCI" in user_dir:

            return 0

        else:  # EMPATICA

            return 2





def getEDR(x, y, FS):

    x = np.array(x).ravel()

    y = np.array(y).ravel()

    try:

        KBK_edr = eda.get_scr(y, FS)

    except:

        KBK_edr = []

        print("Error getting SCR")

    KBK_edr = clean_dataset(KBK_edr)

    #try:

    #    start = tools.find_extrema(signal=KBK_edr, mode='both')[0][0]

    #except:

    #    start = 0

    #    print("Error finding extrema")



    #return list(x[start+1:]), list(minmax_scale(KBK_edr[start:]))

    return x[:-1], minmax_scale(KBK_edr)





def FMCI_fileProc(data):

    return np.array(data)[:, 0], np.array(data)[:, 1]





def getEDA(deviceType, fileDir, CH, ID=None, filt=True):

    numberCH = -1

    if deviceType == 0:  # FMCI

        data = np.genfromtxt(fileDir)

        x, y = FMCI_fileProc(data)

        ID = fileDir[-7:-4] 

        interpf = interp1d(x, y, kind='cubic')  # resample

        FS = 10  # new SR        

        xnew = np.arange(x[0], x[-1], 1/FS)  # all samples with same SR

        y = interpf(xnew)

        x = xnew

        numberCH = [1]

    elif deviceType == 1:  # BIT  ### TODO: Fazer counter ID

        data = np.loadtxt(fileDir)

        _d = data[:, list(np.where(data.any(axis=0))[0][1:])]

        numberCH = list(range(_d.shape[1]))

        y = _d[:, CH] 

        length = len(y)

        FS = 1000

        T = (length - 1) / FS

        x = np.linspace(0, T, length, endpoint=True)

    elif deviceType == 3:  # HDF5

        f = h5py.File(fileDir, 'r')

        FS = f[ID].attrs["sampling rate"]        

        if f[ID]['data'].shape[1] == 2: # FMCI DEV saved in hdf5 file

            x, y = FMCI_fileProc(f[ID]['data'])

            numberCH = [1]      

            interpf = interp1d(x, y, kind='linear')  # resample

            FS = 60  # new SR            

            xnew = np.arange(x[0], x[-1], 1/FS)  # all samples with same SR

            y = interpf(xnew)

            x = xnew

            y = clean_dataset(np.array(y))

            y = eda.get_filt_eda(y, FS, 10)

            y, _ = tools.smoother(signal=y, kernel='bartlett', size=int(20 * FS), mirror=True)            

        else:

            try:

                if f[ID].attrs["type"] == "sense":

                    #x = f[ID]['data'][:, -1] * 0.000001  # to second 

                    numberCH = ["A0"]

                    y = f[ID]['data'][:, 0]  # EDA on A0

                    x = np.arange(0, len(y)/FS, 1/FS)
                    #x+=170

                    if len(x) != len(y):

                        x = x[:-1]

                    y = clean_dataset(np.array(y))

                    y = eda.get_filt_eda(y, FS)

                else:

                    x = f[ID]['data'][:, -1]*0.001  # to second

                    if f[ID]['data'].shape[1] == 14:  # RIOT

                        numberCH = ["A0"]

                        y = f[ID]['data'][:, 5]  # EDA on A0

                        y = clean_dataset(np.array(y))

                        #y = eda.get_filt_eda(y, FS)

                    else:  # BIT

                        c, numberCH = 0, []

                        for i in range(6, f[ID]['data'].shape[1], 1):

                            numberCH += ["A" + str(c)]

                            c += 1

                        y = f[ID]['data'][:, 5 + CH]



            except Exception as e:

                print(e)

    else:  # EMP ### TODO: Fazer counter ID

        FS = 4

        data = pd.read_csv(fileDir)

    try:

        movie = f[ID].attrs["movie"]

    except Exception as e:  # while files where acquiring using this functionality

        print(e)

        movie = "movie.mp4"



    x -= x[0]  # synchronize with movie

    return x, y, int(FS), list(numberCH), str(ID), str(movie)





def parseData(x, y, x2, y2):

    data = []

    for i, d in enumerate(y):

        data.append([])

        data[i] = {}

        data[i]['time'] = np.round(x[i], 3)

        data[i]['value'] = np.round(d, 3)

        try:

            data[i]['edrTime'] = np.round(x2[i], 3)

            data[i]['edrValue'] = np.round(y2[i], 3)

        except:

            data[i]['edrTime'] = np.round(x2[-1], 3)

            data[i]['edrValue'] = np.round(y2[-1], 3)

    return data





def get_edr(x, y, SR = 100, TH = 0.05, SIG="eda"):

    ''' EDA processing pipeline for extraction of onsets based on the threshold of

    0.01 < TH < 0.05 microSiemens for amplitude from Boucesein et al. 2012



    Input

    --------

    x : array

        Time vector

    y : array

        Input EDA signal, raw

    SR : float

        Sampling rate

    TH : float

        Threshold amplitude for detected onsets



    Output

    ------

    '''

    # filtering

    #y_filt = eda.get_filt_eda(y, SR)


    # resampling



    #y_interp = clean_dataset(np.array(y_interp))

    y_interp = ((y/2**12)*3.3)/0.12

    # GET SCR
    if SIG == "edr":
        #y_interp = eda.get_scr(y, SR)
        y_interp, _ = tools.smoother(signal=y_interp, kernel='bartlett', size=int(4 * SR), mirror=True)    
    try:

        y_interp, _ = tools.smoother(signal=y_interp, kernel='bartlett', size=int(8 * SR), mirror=True)    
        # our dataset

        on, pks, amp, end = eda.get_eda_param(y_interp, TH, False)

        on, end, amp = merge_events(y_interp, on, end, amp, 30*SR)  # 10  x[-1] - x[0]  np.sqrt(len(x))/3


    except Exception as e:

        print(e, "Error obtaining onsets")



    return x, y_interp, SR, np.array(on), np.array(amp), np.array(pks)





def upd_annM(x, y, FS):

    x = np.array(x)
    NUM_EVENTS = 7
    #plt.figure(figsize=(20, 10))
    #plt.plot(x, (y-y.max())/(y.max() - y.min()))
    try:
        x, y, FS, on, amp, _ = get_edr(x, y, SR=FS, TH = 0.01)  # pipeline EDR

        #x = x[1:]

        #on, _, amp, end = eda.get_eda_param(y, TH, False)

        #on, end, amp = get_EDR_Events(y, on, end, amp, 10*FS)  # 10  x[-1] - x[0]  np.sqrt(len(x))/3

    except Exception as e:
        print(e)
        on = []
        end = []

    if len(on) >= 1:
        # sort by events amplitude
        try:
            sortedAmpIDX = np.argsort(amp)[::-1]
            sortedAmpIDX = sortedAmpIDX[:NUM_EVENTS]

        except Exception as e:
            print(e)
            sortedAmpIDX = np.arange(len(amp)-1)

        on = np.array(on)[sortedAmpIDX]
        end = np.array(on) + 15*FS
        on = np.array(on) - 5*FS
        sortedAmpOn = np.argsort(on)

        on = on[sortedAmpOn]
        end = end[sortedAmpOn]
    if len(on) < 2:
        if x[-1] > 22:
            wind = len(x) // (NUM_EVENTS +1)
            rem = len(x) % (NUM_EVENTS +1)
            start = 0

            divisions = []
            for _ in range(NUM_EVENTS):
                start += wind
                if rem > 0:
                    start += 1
                    rem -= 1
                divisions.append(start)
            on = np.array(divisions)  
            end = on + 20*FS
        else:
            on = np.array([0])
            end = np.array([len(x)-1])
    if x[-1] > 22:
        on_idx = np.where(on < FS)[0]
        on[on_idx] = 0
        end[on_idx] = 20*FS
        end_idx = np.where(on >= (len(x)-(21*FS)))[0] 
        on[end_idx] = len(x)-(21*FS)
        end[end_idx] = len(x)-(1*FS)

    # unique set of on
    on = np.unique(on)
    end = np.unique(end)
    #plt.plot(x, (y-y.max())/(y.max() - y.min()), c="r")
    #ny = (y-y.max())/(y.max() - y.min())
    #for idx in on:
    #    plt.plot(x[idx], ny[idx], "ro", color="g")
    #plt.savefig("test.png")
    ## additional annotations common to all
    #newAnnidx_on = np.array([2*60*FS, (len(x)/2)-(2*60*FS), len(x)-2*60*FS]).astype(np.int)
    #newAnnidx_end = newAnnidx_on + 10*FS
    #on = np.hstack((newAnnidx_on, on)).astype(np.int)
    #end = np.hstack((newAnnidx_end, end)).astype(np.int)

    ann_l_s = [round(x[d]) for d in on]  # defines video starting time
    try:
        ann_l = [str(datetime.timedelta(seconds=round(x[on][i]))) + ' - ' + str(datetime.timedelta(seconds=round(x[end][i]))) for i in range(len(ann_l_s))]  # put in right format for annotation menu in browser
    except Exception as e: 
        print(e)
        ann_l = []

    return ann_l, ann_l_s





def randomAnn(x, FS):

    x = np.array(x)

 

    try:

        NumberOfSeg = np.random.randint(int(np.sqrt(x[-1])/2.5), int(np.sqrt(x[-1])/1.5))  # defines video starting time

    except:

        NumberOfSeg = 12

    try:

        ann_l_s = [np.random.randint(5*FS, len(x)-5*FS) for d in range(NumberOfSeg)]  # start time

    except:

        ann_l_s = [np.random.randint(0, len(x)) for d in range(NumberOfSeg)]  # start time



    ann_l_e = np.array(ann_l_s) + 10*FS # end time

    

    try:

        ann_l = [str(datetime.timedelta(seconds=round(x[ann_l_s[i]]))) + ' - ' + str(datetime.timedelta(seconds=round(x[ann_l_e[i]]))) for i in range(len(ann_l_s))]  # put in right format for annotation menu in browser

    except Exception as e: 

        print(e)

        ann_l = []



    ann_l_s = [round(x[d]) for d in ann_l_s]  # defines video starting time    

    return ann_l, ann_l_s





def find_scenes(video_path):

    # Create our video & scene managers, then add the detector.

    video_manager = VideoManager([video_path])

    stats_manager = StatsManager()

    # Construct our SceneManager and pass it our StatsManager.

    scene_manager = SceneManager(stats_manager)

    fps = int(video_manager.get_framerate())

    scene_manager.add_detector(

        ContentDetector(threshold=60, min_scene_len=20*fps))  # 65 is before

    

    pt = video_path.split("/")

    # We save our stats file to {VIDEO_PATH}.stats.csv.

    stats_file_path = pt[0] + "/" + pt[1] + "/stats/" + pt[2][:-4] + "_stats.csv"



    # If stats file exists, load it.

    if os.path.exists(stats_file_path):

        # Read stats from CSV file opened in read mode:

        with open(stats_file_path, 'r') as stats_file:

            stats_manager.load_from_csv(stats_file)



     # Set downscale factor to improve processing speed.

    video_manager.set_downscale_factor()

    # Start video_manager.

    video_manager.start()

    # Perform scene detection on video_manager.

    scene_manager.detect_scenes(frame_source=video_manager)

    # Obtain list of detected scenes.

    scene_list = scene_manager.get_scene_list()

    # Each scene is a tuple of (start, end) FrameTimecodes.

    scene_list = np.array(scene_list)

    scenes = [[], []]

    for i in range(len(scene_list[:, 0])):

        if scene_list[:, 0][i].get_seconds() <= 10:

            continue

        scenes[0] += [scene_list[:, 0][i].get_seconds()]

        scenes[1] += [scene_list[:, 1][i].get_seconds()]



    base_timecode = video_manager.get_base_timecode()

    with open(stats_file_path, 'w') as stats_file:

        stats_manager.save_to_csv(stats_file, base_timecode)

    video_manager.release()

    try:

        ann_l = [str(datetime.timedelta(seconds=round(scenes[0][i]))) + ' - ' + str(datetime.timedelta(seconds=round(scenes[1][i]))) for i in range(len(scenes[0]))]  # put in right format for annotation menu in browser

    except Exception as e: 

        print(e)

        ann_l = []

    

    ann_l_s = np.array(scenes[1]) - 10

    ann_l_s = ann_l_s.tolist()

    

    return ann_l, ann_l_s







def selfReport(dimension, session, value):

    try:

        session['_selfReport'][session['devID']]

    except:

        session['_selfReport'][session['devID']] = {}

    try:

        session['_selfReport'][session['devID']][session['userAnnMenu'][session['annTID']]][dimension] = value

    except Exception as e:  # if its a new annotation, _t is not key for self_report 

        print("exception ", e)

        session['_selfReport'][session['devID']][session['userAnnMenu'][session['annTID']]] = {}

        session['_selfReport'][session['devID']][session['userAnnMenu'][session['annTID']]][dimension] = value        

    if "Input" in dimension:

        value = str(value).encode("utf-8", "ignore")

    t = session['userAnnMenu'][session['annTID']].replace(" ", "").split('-')  # process data into right form

    _t = t[0].split(":")

    st_seconds = datetime.timedelta(hours=float(_t[0]), minutes=float(_t[1]), seconds=float(_t[2])).total_seconds()

    _t = t[1].split(":")  

    end_seconds = datetime.timedelta(hours=float(_t[0]), minutes=float(_t[1]), seconds=float(_t[2])).total_seconds()

    if session["deviceType"] != 3:  # not hdf5 file 

        if os.path.isfile(session["devicesFiles"][session['fileID']][:-4] + '_' + dimension +'.txt'):  # if txt file exists

            data = open(session["devicesFiles"][session['fileID']][:-4] + '_' + dimension +'.txt', 'a')  # open file

            data.write(str(st_seconds) + '\t' + str(end_seconds) + '\t' + str(value) + '\n')  # add annotation

            data.close()  # close file

        else:  # create header for annotation file

            data = open(session["devicesFiles"][session['fileID']][:-4] + '_' + dimension +'.txt', 'w')  # open file

            data.write("#EventStart" + '\t' + "EventEnd" + '\t' + "Ranking" + '\n')  # write header labels

            data.write(str(st_seconds) + '\t' + str(end_seconds) + '\t' + str(value) + '\n')  # write subject annotation      

            data.close()  # close file

    else:  # hdf5 file 

        f = h5py.File(session["devicesFiles"][session['fileID']], "r+")  # create hdf5 file

        data_content = np.array([round(time.time(), 3), st_seconds, end_seconds, value]).reshape(1, -1)  # concatenate device eda + time data

        HEADER = ["Annotation Time", "EventStart", "EventEnd", "Ranking"]

        

        if dimension not in f[session['devID']].keys():   # no previous annotation - file doesn't have a prev Arousal annotation

            f[session['devID']].create_dataset(dimension, data=data_content, compression="gzip", chunks=True, maxshape=(None, len(HEADER))) 

            f[session['devID']+'/' + dimension].attrs["header"] = HEADER # give device attribute with its starting time

        else:

            f[session['devID']+'/' + dimension].resize((f[session['devID']+'/'+ dimension].shape[0] + 1), axis = 0)  # resize dataset to fit new data

            f[session['devID']+'/' + dimension][-1:] = data_content  # append new data

        f.close()

    return session['_selfReport']
