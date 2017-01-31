from PIL import Image
import math
import itertools

def make_chunks(image_path, num_h_crop = 2, num_v_crop = 2, overlap = 10):
    """slice an image into parts """
    img = Image.open(image_path)
    width, height = img.size

    # compute crop properties using image measure and the wanted number of pieces
    h_crop_width = width / num_h_crop
    v_crop_width = height / num_v_crop

    # transform overlap percent into px :
    h_overlap_width = width * overlap /100
    v_overlap_width = height * overlap /100
    
    
    # x and y represent Cartesian pixel coordinates.
    # 0,0 is up left
    # the norm between 2 ticks on horizontal x axis is h_crop_width
    # the norm between 2 ticks on vertical y axis is v_crop_width
    x = [h_crop_width * e for e in range (num_h_crop +1)]
    y = [v_crop_width * e for e in range (num_v_crop +1)]
    # +1 in order to have coord of rigth limit of the image

    chunks_starting_coords = itertools.product(y[:-1], x[:-1])
    chunks_ending_coords = itertools.product(y[1:], x[1:])

    chunks_coords = zip (chunks_starting_coords, chunks_ending_coords)
    for chunk_idx, chunk_coords in enumerate(chunks_coords) :
        ((upper, left ), (lower, right)) = chunk_coords
        box = (left -h_overlap_width, upper-v_overlap_width , right+h_overlap_width , lower+v_overlap_width) # pixel coords of the chunk
        print (chunk_idx, box,  (left , upper, right, lower))
        new_chunk = img.crop( map (int, box ))
        new_chunk.save("out_{0}.jpg".format(chunk_idx) )
